import type { NoteAPIClient } from "../client";
import type { CurrentUser } from "../types/user/CurrentUser";

/**
 * Fetches the logged-in user. GET /v2/current_user
 *
 * Requires session cookies; useful to verify that they are still valid.
 * Rejects with a NoteAPIError (status 401, or 404 for a guest session) when not logged in.
 */
export async function getCurrentUser(this: NoteAPIClient): Promise<CurrentUser> {
  return this.get<CurrentUser>(`${this.BASE_URL}/v2/current_user`);
}
