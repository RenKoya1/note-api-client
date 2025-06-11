import { NoteAPIClient } from "../client";

export async function getHashtagDetail(
  this: NoteAPIClient,
  {
    hashtag,
  }: {
    hashtag: string;
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v2/hashtags/${hashtag}`;
  const params = {};

  return this.get<any>(url, params);
}
