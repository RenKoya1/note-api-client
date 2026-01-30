import { NoteAPIClient } from "../client";
import { HashtagSearchResponse } from "../types/note/HashtagSearchNote";

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
): Promise<HashtagSearchResponse> {
  const url = `${this.BASE_URL}/v3/hashtags/${hashtag}/notes`;
  const params = {
    paid_only: paid_only,
    order: order,
    page: page,
  };

  return this.get<HashtagSearchResponse>(url, params);
}

