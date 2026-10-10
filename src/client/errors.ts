/**
 * Error thrown for every failed note.com API call.
 *
 * note.com reports failures in several shapes, sometimes with a 2xx status:
 *   {"error":{"code":"auth","message":"not_login"}}
 *   {"error":{"message":"Invalid order type","type":"bad_request"}}
 *   {"error":"マガジンが見つかりません"}
 *   {"data":"リソースが見つかりません"}            (with 4xx status)
 * All of them are normalized into `code` / `message` here.
 */
export class NoteAPIError extends Error {
  /** HTTP status code, or undefined when no response was received. */
  public readonly status: number | undefined;
  /** Error code reported by note.com (e.g. "not_login", "required_recaptcha", "bad_request"). */
  public readonly code: string | undefined;
  /** HTTP method of the failed request. */
  public readonly method: string;
  /** Request URL of the failed request. */
  public readonly url: string;
  /** Raw response body, if any. */
  public readonly body: unknown;

  constructor(params: {
    message: string;
    method: string;
    url: string;
    status?: number | undefined;
    code?: string | undefined;
    body?: unknown;
    cause?: unknown;
  }) {
    super(params.message, params.cause === undefined ? undefined : { cause: params.cause });
    this.name = "NoteAPIError";
    this.status = params.status;
    this.code = params.code;
    this.method = params.method;
    this.url = params.url;
    this.body = params.body;
  }
}

/**
 * Extracts `{ code, message }` from a note.com error body.
 * Returns undefined when the body does not look like an error.
 */
export function parseErrorBody(
  body: unknown,
): { code: string | undefined; message: string } | undefined {
  if (body === null || typeof body !== "object") return undefined;
  const err = (body as Record<string, unknown>).error;
  if (typeof err === "string") return { code: undefined, message: err };
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const code =
      typeof e.code === "string"
        ? e.code
        : typeof e.type === "string"
          ? e.type
          : undefined;
    const message =
      typeof e.message === "string" ? e.message : JSON.stringify(err);
    return { code, message };
  }
  return undefined;
}
