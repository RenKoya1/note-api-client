import { NoteAPIClient } from "../client";
import { User } from "../types/user/User";

export async function searchUserByUsername(
  this: NoteAPIClient,
  {
    username,
  }: {
    username: string;
  }
) {
  return this.get<User>(`${this.BASE_URL}/v2/creators/${username}`);
}
