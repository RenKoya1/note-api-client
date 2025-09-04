import { NoteAPIClient } from "../client";
interface SignInRequest {
  g_recaptcha_response: string;
  email: string;
  password: string;
  redirect_path?: string;
}
export async function signIn(
  this: NoteAPIClient,
  {
    g_recaptcha_response,
    email,
    password,
    redirect_path = "https://note.com/",
  }: SignInRequest
): Promise<any> {
  const endpoint = `${this.BASE_URL}/v1/sessions/sign_in`;
  return this.post<any>(endpoint, {
    g_recaptcha_response,
    login: email,
    password,
    redirect_path,
  });
}
