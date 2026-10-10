import type { NoteAPIClient } from "../client";
import { pathSegment } from "../client/params";
import type { User } from "../types/user/User";

/**
 * Fetches a creator profile by urlname. GET /v2/creators/{urlname}
 *
 * @param username Creator urlname (e.g. "info" for https://note.com/info).
 */
export async function searchUserByUsername(
  this: NoteAPIClient,
  { username }: { username: string },
): Promise<User> {
  return this.get<User>(`${this.BASE_URL}/v2/creators/${pathSegment("username", username)}`);
}
