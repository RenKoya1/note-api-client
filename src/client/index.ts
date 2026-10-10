import axios, { type AxiosInstance, type Method } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { mergeCookies } from "./cookies";
import { NoteAPIError, parseErrorBody } from "./errors";
import { searchNotesByKeyword } from "../note/searchNotesByKeyword";
import { getNoteDetail } from "../note/getNoteDetail";
import { searchNotesByUsername } from "../note/searchNotesByUsername";
import { saveDraft } from "../note/saveDraft";
import { searchUsersByKeyword } from "../user/searchUsersByKeyword";
import { getFollowings } from "../user/getFollowings";
import { getFollowers } from "../user/getFollowers";
import { getComments } from "../note/getComments";
import { getNoteComments } from "../note/getNoteComments";
import { getNoteLikes } from "../note/getNoteLikes";
import { searchMagazinesByKeyword } from "../magazine/searchMagazinesByKeyword";
import { searchMagazinesByUsername } from "../magazine/searchMagazinesByUsername";
import { getMagazineDetail } from "../magazine/getMagazineDetail";
import { getMagazineNotes } from "../magazine/getMagazineNotes";
import { getCategories } from "../category/getCategories";
import { searchNotesByCategory } from "../note/searchNotesByCategory";
import { getHashtags } from "../hashtag/getHastags";
import { searchHashtagsByKeyword } from "../hashtag/searchHashtagsByKeyword";
import { searchNotesByHashtag } from "../note/searchNotesByHashtag";
import { getHashtagDetail } from "../hashtag/getHashtagDetail";
import { getContests } from "../contest/getContests";
import { getRecommendMetadata } from "../recommend/getRecommendMetadata";
import { getMkitLayouts } from "../mkit/getMkitLayouts";
import { searchUserByUsername } from "../user/searchUserByUsername";
import { getCurrentUser } from "../user/getCurrentUser";
import { signIn } from "../authentication/signIn";
import { createNote } from "../note/createNote";
import { editNote } from "../note/editNote";
import { uploadEyecatch } from "../eyecatch/uploadEyecatch";
import { draftDelete } from "../note/draftDelete";
import { deleteNote } from "../note/deleteNote";

export { NoteAPIError } from "./errors";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

export interface NoteAPIClientOptions {
  /**
   * Cookie header value of a logged-in note.com session, e.g.
   * `"_note_session_v5=xxxxxxxx"`. Required for write operations.
   */
  cookies?: string | undefined;
  /**
   * HTTP(S) proxy URL every request is routed through. Invalid values are
   * ignored with a warning and requests go out directly.
   */
  proxyUrl?: string | undefined;
  /** Request timeout in milliseconds. Defaults to 14000. */
  timeout?: number | undefined;
  /** User-Agent header sent with every request. */
  userAgent?: string | undefined;
  /**
   * How often a GET request is retried after a transient failure
   * (network error, timeout, 429, 502, 503, 504). Defaults to 2; 0 disables.
   * Other methods are never retried.
   */
  retries?: number | undefined;
}

type Params = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// An unusable proxy URL (e.g. an undecrypted "encrypted:..." secret leaking
// through from env tooling) would make every request fail with an empty
// connection error, so fall back to a direct connection instead.
function sanitizeProxyUrl(proxyUrl?: string): string | undefined {
  if (!proxyUrl) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(proxyUrl);
  } catch {
    console.warn(
      "[note-api-client] proxyUrl is not a valid URL; connecting without proxy",
    );
    return undefined;
  }
  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    !parsed.hostname
  ) {
    console.warn(
      `[note-api-client] proxyUrl has unsupported protocol "${parsed.protocol}" or no host; connecting without proxy`,
    );
    return undefined;
  }
  return proxyUrl;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const TRANSIENT_STATUSES = new Set([429, 502, 503, 504]);

function isTransient(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true; // network error or timeout
  return TRANSIENT_STATUSES.has(error.response.status);
}

// Exponential backoff (0.5s, 1s, 2s, ...), honoring Retry-After up to 10s.
function retryDelay(error: unknown, attempt: number): number {
  const header = axios.isAxiosError(error) ? error.response?.headers["retry-after"] : undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds, 10) * 1000;
  return 500 * 2 ** (attempt - 1);
}

// Drop undefined values so they are not serialized as "undefined".
function compactParams(params?: Params): Params | undefined {
  if (!params) return undefined;
  const result: Params = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) result[key] = value;
  }
  return result;
}

export class NoteAPIClient {
  private client: AxiosInstance;
  private userAgent: string;
  private retries: number;
  /** Request timeout in milliseconds. */
  public readonly timeout: number;

  public BASE_URL = "https://note.com/api";
  public cookies: string | null = null;
  public csrfToken: string | null = null;

  /**
   * @param cookiesOrOptions Cookie header of a logged-in session, or an options object.
   * @param proxyUrl Proxy URL (positional form, kept for backward compatibility).
   */
  constructor(cookiesOrOptions?: string | NoteAPIClientOptions, proxyUrl?: string) {
    const options: NoteAPIClientOptions =
      typeof cookiesOrOptions === "object" && cookiesOrOptions !== null
        ? cookiesOrOptions
        : { cookies: cookiesOrOptions, proxyUrl };
    if (options.cookies) {
      this.cookies = options.cookies;
    }
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    this.retries = Math.max(0, Math.floor(options.retries ?? 2));
    this.timeout = options.timeout ?? 14000;
    // note.com issues a write-capable session only for residential JP IPs.
    // When a proxy URL is supplied, route every request through it so
    // sign-in and writes share the same egress IP.
    const validProxyUrl = sanitizeProxyUrl(options.proxyUrl);
    this.client = axios.create({
      timeout: this.timeout,
      ...(validProxyUrl
        ? {
            httpsAgent: new HttpsProxyAgent(validProxyUrl),
            proxy: false as const,
          }
        : {}),
    });
  }

  /** Whether the client holds a session cookie (does not verify it; see getCurrentUser). */
  public get isAuthenticated(): boolean {
    return !!this.cookies && this.cookies.includes("_note_session_v5=");
  }

  private buildHeaders(hasJsonBody: boolean): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json, text/plain, */*",
      "User-Agent": this.userAgent,
      Origin: "https://note.com",
      Referer: "https://note.com/",
      "X-Requested-With": "XMLHttpRequest",
    };
    // FormData must not get a JSON content type: axios would serialize it to
    // JSON and the upload endpoints answer "no_file_selected".
    if (hasJsonBody) headers["Content-Type"] = "application/json";
    if (this.cookies) headers.Cookie = this.cookies;
    if (this.csrfToken) {
      headers["x-note-csrf-token"] = this.csrfToken;
      headers["X-CSRF-Token"] = this.csrfToken;
      headers["X-XSRF-TOKEN"] = this.csrfToken;
    }
    return headers;
  }

  private storeCookies(setCookie: string[] | string | undefined) {
    const list = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    this.cookies = mergeCookies(this.cookies, list);
  }

  /**
   * Sends a request to note.com and returns the `data` field of the response.
   * Throws NoteAPIError for HTTP errors and for 2xx responses carrying an
   * `error` body.
   */
  private async withRetry<R>(method: string, send: () => Promise<R>): Promise<R> {
    const maxAttempts = method === "GET" ? this.retries + 1 : 1;
    for (let attempt = 1; ; attempt++) {
      try {
        return await send();
      } catch (error) {
        if (attempt >= maxAttempts || !isTransient(error)) throw error;
        await sleep(retryDelay(error, attempt));
      }
    }
  }

  public async request<T = unknown>(
    method: Method,
    url: string,
    options: { params?: Params | undefined; data?: unknown } = {},
  ): Promise<T> {
    const body = await this.requestBody<{ data: T }>(method, url, options);
    return body.data;
  }

  /**
   * Like `request`, but returns the whole JSON body instead of its `data`
   * field. Some endpoints put pagination info next to `data`
   * (e.g. `{ data: [...], next_page: 2, total_count: 57 }`).
   */
  public async requestBody<T extends { data: unknown } = { data: unknown }>(
    method: Method,
    url: string,
    options: { params?: Params | undefined; data?: unknown } = {},
  ): Promise<T> {
    const { data } = options;
    const params = compactParams(options.params);
    const upperMethod = method.toUpperCase();
    const hasJsonBody = data !== undefined && !(data instanceof FormData);

    let response;
    try {
      response = await this.withRetry(upperMethod, () =>
        this.client.request({
          method,
          url,
          params,
          data,
          headers: this.buildHeaders(hasJsonBody),
        }),
      );
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;
      const res = error.response;
      if (res) this.storeCookies(res.headers["set-cookie"]);
      const body = res?.data;
      const parsed =
        parseErrorBody(body) ??
        (isRecord(body) && typeof body.data === "string"
          ? { code: undefined, message: body.data }
          : undefined);
      const status = res?.status;
      throw new NoteAPIError({
        message: `note API request failed: ${upperMethod} ${url}${status ? ` -> ${status}` : ""}: ${parsed?.message ?? error.message}`,
        method: upperMethod,
        url,
        status,
        code: parsed?.code ?? (status ? undefined : error.code),
        body,
        cause: error,
      });
    }

    this.storeCookies(response.headers["set-cookie"]);
    const body = response.data;
    const parsed = parseErrorBody(body);
    if (parsed) {
      throw new NoteAPIError({
        message: `note API error: ${parsed.code ?? "unknown"} - ${parsed.message}`,
        method: upperMethod,
        url,
        status: response.status,
        code: parsed.code,
        body,
      });
    }
    if (!isRecord(body) || !("data" in body)) {
      throw new NoteAPIError({
        message: `note API returned an unexpected response: ${upperMethod} ${url} -> ${response.status}`,
        method: upperMethod,
        url,
        status: response.status,
        body,
      });
    }
    if (isRecord(body.data) && typeof body.data.csrf_token === "string") {
      this.csrfToken = body.data.csrf_token;
    }
    // The payload shape is described by T; it is checked against the live
    // API by the contract tests (npm run test:live).
    return body as T;
  }

  public get<T = unknown>(url: string, params?: Params): Promise<T> {
    return this.request<T>("GET", url, { params });
  }

  public post<T = unknown>(url: string, data?: unknown, params?: Params): Promise<T> {
    return this.request<T>("POST", url, { data, params });
  }

  public put<T = unknown>(url: string, data?: unknown, params?: Params): Promise<T> {
    return this.request<T>("PUT", url, { data, params });
  }

  public delete<T = unknown>(url: string, data?: unknown, params?: Params): Promise<T> {
    return this.request<T>("DELETE", url, { data, params });
  }

  // Notes
  public searchNotesByKeyword = searchNotesByKeyword;
  public searchNotesByUsername = searchNotesByUsername;
  public searchNotesByCategory = searchNotesByCategory;
  public searchNotesByHashtag = searchNotesByHashtag;
  public getNoteDetail = getNoteDetail;
  public getComments = getComments;
  public getNoteComments = getNoteComments;
  public getNoteLikes = getNoteLikes;
  public createNote = createNote;
  public saveDraft = saveDraft;
  public editNote = editNote;
  public deleteNote = deleteNote;
  public draftDelete = draftDelete;
  public uploadEyecatch = uploadEyecatch;

  // Users
  public searchUsersByKeyword = searchUsersByKeyword;
  public searchUserByUsername = searchUserByUsername;
  public getFollowings = getFollowings;
  public getFollowers = getFollowers;
  public getCurrentUser = getCurrentUser;
  public signIn = signIn;

  // Magazines
  public searchMagazinesByKeyword = searchMagazinesByKeyword;
  public searchMagazinesByUsername = searchMagazinesByUsername;
  public getMagazineDetail = getMagazineDetail;
  public getMagazineNotes = getMagazineNotes;

  // Hashtags / categories / misc
  public getCategories = getCategories;
  public getHashtags = getHashtags;
  public searchHashtagsByKeyword = searchHashtagsByKeyword;
  public getHashtagDetail = getHashtagDetail;
  public getContests = getContests;
  public getRecommendMetadata = getRecommendMetadata;
  public getMkitLayouts = getMkitLayouts;
}
