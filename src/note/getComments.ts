import type { NoteAPIClient } from "../client";
import { pathSegment } from "../client/params";
import type { CommentsResponse } from "../types/note/Comment";

/**
 * Fetches comments of a note. GET /v1/note/{id}/comments
 *
 * @param id Numeric note id (`NoteDetail.id`), not the note key.
 */
export async function getComments(
  this: NoteAPIClient,
  { id }: { id: string | number },
): Promise<CommentsResponse> {
  return this.get<CommentsResponse>(
    `${this.BASE_URL}/v1/note/${pathSegment("id", id)}/comments`,
  );
}
