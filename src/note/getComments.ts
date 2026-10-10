import type { NoteAPIClient } from "../client";
import { pathSegment } from "../client/params";
import type { CommentsResponse } from "../types/note/Comment";

/**
 * Fetches comments of a note in the legacy comment system.
 * GET /v1/note/{id}/comments
 *
 * Returns up to 50 comments, newest first; `rest_comment_count` is the number
 * of older comments. Pass the smallest `id` you received as `maxId` to get the
 * next older batch.
 *
 * Notes with `NoteDetail.capabilities.note_comment === true` return no
 * comments here; use `getNoteComments` for them.
 *
 * @param id Numeric note id (`NoteDetail.id`), not the note key.
 * @param maxId Only return comments with an id lower than this.
 */
export async function getComments(
  this: NoteAPIClient,
  { id, maxId }: { id: string | number; maxId?: number | undefined },
): Promise<CommentsResponse> {
  return this.get<CommentsResponse>(`${this.BASE_URL}/v1/note/${pathSegment("id", id)}/comments`, {
    max_id: maxId,
  });
}
