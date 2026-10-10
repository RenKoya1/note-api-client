import type { NoteAPIClient } from "../client";
import { requireParam } from "../client/params";

export interface SaveDraftResponse {
  result: boolean;
  note_days_count: number;
  updated_at: string;
}

/**
 * Saves the draft body of a note. POST /v1/text_notes/draft_save
 *
 * @param id Numeric note id returned by createNote.
 * @param isTempSaved true (default) for an auto-save, false for an explicit "save draft".
 * @param index Enable the table of contents (requires `<table-of-contents>` in the body).
 * Requires session cookies.
 */
export async function saveDraft(
  this: NoteAPIClient,
  {
    id,
    title,
    body,
    isTempSaved = true,
    index = false,
  }: {
    id: string | number;
    title: string;
    body: string;
    isTempSaved?: boolean | undefined;
    index?: boolean | undefined;
  },
): Promise<SaveDraftResponse> {
  const noteId = requireParam("id", id);
  return this.post<SaveDraftResponse>(
    `${this.BASE_URL}/v1/text_notes/draft_save`,
    {
      name: title,
      body,
      body_length: body.replace(/<[^>]*>/g, "").length,
      index,
      is_lead_form: false,
    },
    // The editor only sends is_temp_saved when it is true.
    { id: noteId, is_temp_saved: isTempSaved ? true : undefined },
  );
}
