import type { NoteAPIClient } from "../client";
import { pageParam, pathSegment } from "../client/params";
import type { MagazineNotesResponse } from "../types/magazine/Magazine";

/**
 * Lists notes added to a magazine. GET /v1/magazines/{key}/notes
 *
 * Returns 100 notes per page together with the magazine info. Use
 * `next_page` / `last_page` to paginate.
 */
export async function getMagazineNotes(
  this: NoteAPIClient,
  { key, page = 1 }: { key: string; page?: number },
): Promise<MagazineNotesResponse> {
  return this.get<MagazineNotesResponse>(
    `${this.BASE_URL}/v1/magazines/${pathSegment("key", key)}/notes`,
    { page: pageParam(page) },
  );
}
