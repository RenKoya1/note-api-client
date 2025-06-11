import { NoteAPIClient } from "../client";

export async function searchNotesByHashtag(
  this: NoteAPIClient,
  {
    hashtag,
    page = 1,
    order = "popular",
  }: {
    hashtag: string;
    page?: number;
    order?: "new" | "popular" | "hot";
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v3/hashtags/${hashtag}/notes`;
  const params = {
    paid_only: "false",
    order: order,
    page: page,
  };

  return this.get<any>(url, params);
}
