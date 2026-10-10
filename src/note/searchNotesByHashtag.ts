import type { NoteAPIClient } from "../client";
import { normalizeHashtag, pageParam } from "../client/params";
import type { HashtagSearchResponse } from "../types/note/HashtagSearchNote";

/**
 * Lists notes tagged with a hashtag. GET /v3/hashtags/{hashtag}/notes
 *
 * @param hashtag Hashtag with or without the leading "#".
 * @param order "popular" (default), "new" or "hot".
 * @param paid_only Only return paid notes.
 * @param page 1-based page number (50 notes per page). Use `next_page` / `is_last_page`.
 */
export async function searchNotesByHashtag(
  this: NoteAPIClient,
  {
    hashtag,
    page = 1,
    order = "popular",
    paid_only = false,
  }: {
    hashtag: string;
    page?: number | undefined;
    order?: "new" | "popular" | "hot" | undefined;
    paid_only?: boolean | undefined;
  },
): Promise<HashtagSearchResponse> {
  return this.get<HashtagSearchResponse>(
    `${this.BASE_URL}/v3/hashtags/${encodeURIComponent(normalizeHashtag(hashtag))}/notes`,
    { order, paid_only, page: pageParam(page) },
  );
}
