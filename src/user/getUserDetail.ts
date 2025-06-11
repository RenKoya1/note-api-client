import { NoteAPIClient } from "../client";

export async function getUserDetail(
  this: NoteAPIClient,
  {
    username,
  }: {
    username: string;
  }
): Promise<any> {
  return this.get<any>(`${this.BASE_URL}/v2/creators/${username}/list`, {});
}
