import { NoteAPIClient } from "../client";

export async function getFollowings(
  this: NoteAPIClient,
  {
    key,
    page = 1,
    per = 20,
  }: {
    key: string;
    page?: number;
    per?: number;
  }
): Promise<any> {
  const params = {
    page: page,
    per: per,
  };
  return this.get<any>(`${this.BASE_URL}/v3/users/${key}/followers`, params);
}
