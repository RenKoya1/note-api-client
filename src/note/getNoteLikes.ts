import type { NoteAPIClient } from "../client";
import { pageParam, pathSegment } from "../client/params";
import type { NoteLikesResponse } from "../types/note/Like";

/**
 * Fetches users who liked a note. GET /v3/notes/{key}/likes
 *
 * Returns 50 likes per page; a page with an empty `likes` array is past the end.
 */
export async function getNoteLikes(
  this: NoteAPIClient,
  { key, page = 1 }: { key: string; page?: number },
): Promise<NoteLikesResponse> {
  return this.get<NoteLikesResponse>(
    `${this.BASE_URL}/v3/notes/${pathSegment("key", key)}/likes`,
    { page: pageParam(page) },
  );
}
