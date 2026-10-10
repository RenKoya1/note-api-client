import type { NoteAPIClient } from "../client";
import { requireParam } from "../client/params";

/** The discarded draft returned by DELETE /v1/text_notes/draft_delete */
export interface DeletedDraft {
  id: number;
  note_id: number;
  name: string;
  body: string;
  description: string | null;
  format: string;
  separator: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface DraftDeleteResponse {
  result: DeletedDraft;
}

/**
 * Discards the draft of a note. DELETE /v1/text_notes/draft_delete
 *
 * For a note that was never published this deletes the note itself
 * (its status becomes "deleted"). For a published note only the unpublished
 * draft changes are discarded. Rejects with status 404
 * ("下書きが見つかりません") when the note has no saved draft.
 *
 * @param id Numeric note id.
 * Requires session cookies.
 */
export async function draftDelete(
  this: NoteAPIClient,
  { id }: { id: string | number },
): Promise<DraftDeleteResponse> {
  const noteId = requireParam("id", id);
  return this.delete<DraftDeleteResponse>(
    `${this.BASE_URL}/v1/text_notes/draft_delete`,
    { id: noteId },
    { id: noteId },
  );
}
