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
  cookies?: string;
  /**
   * HTTP(S) proxy URL every request is routed through. Invalid values are
   * ignored with a warning and requests go out directly.
   */
  proxyUrl?: string;
  /** Request timeout in milliseconds. Defaults to 14000. */
  timeout?: number;
  /** User-Agent header sent with every request. */
  userAgent?: string;
}

type Params = Record<string, unknown>;

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
    // note.com issues a write-capable session only for residential JP IPs.
    // When a proxy URL is supplied, route every request through it so
    // sign-in and writes share the same egress IP.
    const validProxyUrl = sanitizeProxyUrl(options.proxyUrl);
    this.client = axios.create({
      timeout: options.timeout ?? 14000,
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
  public async request<T>(
    method: Method,
    url: string,
    options: { params?: Params; data?: unknown } = {},
  ): Promise<T> {
    const { data } = options;
    const params = compactParams(options.params);
    const upperMethod = method.toUpperCase();
    const hasJsonBody = data !== undefined && !(data instanceof FormData);

    let response;
    try {
      response = await this.client.request({
        method,
        url,
        params,
        data,
        headers: this.buildHeaders(hasJsonBody),
      });
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;
      const res = error.response;
      if (res) this.storeCookies(res.headers["set-cookie"]);
      const body = res?.data;
      const parsed =
        parseErrorBody(body) ??
        (body && typeof body === "object" && typeof body.data === "string"
          ? { code: undefined, message: body.data as string }
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
    if (body === null || typeof body !== "object" || !("data" in body)) {
      throw new NoteAPIError({
        message: `note API returned an unexpected response: ${upperMethod} ${url} -> ${response.status}`,
        method: upperMethod,
        url,
        status: response.status,
        body,
      });
    }
    const csrfToken = (body as any).data?.csrf_token;
    if (typeof csrfToken === "string") this.csrfToken = csrfToken;
    return (body as any).data as T;
  }

  public get<T>(url: string, params?: Params): Promise<T> {
    return this.request<T>("GET", url, { params });
  }

  public post<T>(url: string, data?: unknown, params?: Params): Promise<T> {
    return this.request<T>("POST", url, { data, params });
  }

  public put<T>(url: string, data?: unknown, params?: Params): Promise<T> {
    return this.request<T>("PUT", url, { data, params });
  }

  public delete<T>(url: string, data?: unknown, params?: Params): Promise<T> {
    return this.request<T>("DELETE", url, { data, params });
  }

  // Notes
  public searchNotesByKeyword = searchNotesByKeyword;
  public searchNotesByUsername = searchNotesByUsername;
  public searchNotesByCategory = searchNotesByCategory;
  public searchNotesByHashtag = searchNotesByHashtag;
  public getNoteDetail = getNoteDetail;
  public getComments = getComments;
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
