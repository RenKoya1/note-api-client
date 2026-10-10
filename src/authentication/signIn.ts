import type { NoteAPIClient } from "../client";
import { NoteAPIError } from "../client/errors";

export interface SignInResponse {
  csrf_token?: string | undefined;
  [key: string]: unknown;
}

export interface SignInRequest {
  /** reCAPTCHA Enterprise token from the note.com login page. */
  g_recaptcha_response: string;
  login: string;
  password: string;
  redirect_path?: string | undefined;
}

/**
 * Signs in with email/urlname and password. POST /v1/sessions/sign_in
 *
 * note.com now rejects sign-in without a valid reCAPTCHA token
 * (`required_recaptcha`), so this only succeeds when `g_recaptcha_response`
 * is a real token. For automation, log in with a browser and pass the
 * session cookie to the client instead:
 *
 *   new NoteAPIClient({ cookies: "_note_session_v5=..." })
 *
 * On success the session cookies are stored on the client.
 */
export async function signIn(
  this: NoteAPIClient,
  {
    g_recaptcha_response,
    login,
    password,
    redirect_path = "https://note.com/",
  }: SignInRequest,
): Promise<SignInResponse> {
  const endpoint = `${this.BASE_URL}/v1/sessions/sign_in`;
  try {
    return await this.post<SignInResponse>(endpoint, {
      g_recaptcha_response,
      login,
      password,
      redirect_path,
    });
  } catch (error) {
    if (error instanceof NoteAPIError && error.code === "required_recaptcha") {
      throw new NoteAPIError({
        message:
          "note.com requires a reCAPTCHA token to sign in (required_recaptcha). Log in with a browser and pass the `_note_session_v5` cookie to `new NoteAPIClient({ cookies })` instead.",
        method: error.method,
        url: error.url,
        status: error.status,
        code: error.code,
        body: error.body,
        cause: error,
      });
    }
    throw error;
  }
}
