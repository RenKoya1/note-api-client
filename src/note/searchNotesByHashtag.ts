import { NoteAPIClient } from "../client";

export async function searchNotesByHashtag(
  this: NoteAPIClient,
  {
    hashtag,
    page = 1,
    order = "popular",
    paid_only = false,
  }: {
    hashtag: string;
    page?: number;
    order?: "new" | "popular" | "hot";
    paid_only?: boolean;
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v3/hashtags/${hashtag}/notes`;
  const params = {
    paid_only: paid_only,
    order: order,
    page: page,
  };

  return this.get<any>(url, params);
}
