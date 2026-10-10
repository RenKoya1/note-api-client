import type { NoteAPIClient } from "../client";
import { requireParam } from "../client/params";

/**
 * Discards the draft of a note. DELETE /v1/text_notes/draft_delete
 *
 * For a note that was never published this deletes the note itself
 * (its status becomes "deleted"). For a published note only the unpublished
 * draft changes are discarded.
 *
 * @param id Numeric note id.
 * Requires session cookies.
 */
export async function draftDelete(
  this: NoteAPIClient,
  { id }: { id: string | number },
): Promise<any> {
  const noteId = requireParam("id", id);
  return this.delete<any>(
    `${this.BASE_URL}/v1/text_notes/draft_delete`,
    { id: noteId },
    { id: noteId },
  );
}
