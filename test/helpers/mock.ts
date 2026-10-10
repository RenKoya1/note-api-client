import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { NoteAPIClient, type NoteAPIClientOptions } from "../../src";

export interface RecordedRequest {
  method: string;
  url: string;
  params: Record<string, unknown> | undefined;
  /** Request body after axios transformRequest (JSON string or FormData). */
  data: unknown;
  /** Parsed JSON body, when the body is JSON. */
  json: any;
  headers: Record<string, string>;
}

export interface MockResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string | string[]>;
}

type Handler = (req: RecordedRequest) => MockResponse | Promise<MockResponse>;

/**
 * Creates a client whose HTTP layer is replaced by `handler`.
 * Every request is recorded in `requests`.
 */
export function mockClient(
  handler: Handler = () => ({ body: { data: {} } }),
  options: NoteAPIClientOptions = {},
) {
  const client = new NoteAPIClient(options);
  const requests: RecordedRequest[] = [];
  (client as any).client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const headers = AxiosHeaders.from(config.headers).toJSON() as Record<string, string>;
    let json: any;
    if (typeof config.data === "string") {
      try {
        json = JSON.parse(config.data);
      } catch {
        json = undefined;
      }
    }
    const req: RecordedRequest = {
      method: (config.method ?? "get").toUpperCase(),
      url: config.url ?? "",
      params: config.params,
      data: config.data,
      json,
      headers,
    };
    requests.push(req);
    const res = await handler(req);
    const response = {
      data: res.body,
      status: res.status ?? 200,
      statusText: String(res.status ?? 200),
      headers: AxiosHeaders.from((res.headers ?? {}) as any),
      config,
    };
    if (response.status >= 400) {
      throw new AxiosError(
        `Request failed with status code ${response.status}`,
        response.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
        config,
        null,
        response as any,
      );
    }
    return response;
  };
  return { client, requests };
}

/** Path of a recorded request relative to https://note.com/api */
export function apiPath(req: RecordedRequest): string {
  return req.url.replace("https://note.com/api", "");
}
