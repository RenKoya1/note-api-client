import type { NoteAPIClient } from "../client";
import { pathSegment } from "../client/params";
import type { NoteStatus } from "../types/note/common";

/**
 * Response of PUT /v1/text_notes/{id}. Only the fields this library relies
 * on are declared; check them before use.
 */
export interface EditNoteResponse {
  id?: number | undefined;
  key?: string | undefined;
  status?: NoteStatus | undefined;
  note_url?: string | undefined;
  [key: string]: unknown;
}

/**
 * Publishes a note (or updates a published one). PUT /v1/text_notes/{id}
 *
 * @param id Numeric note id.
 * @param eyecatchImageKey Sent as `eyecatch_image_key` only when given. An
 *   eyecatch uploaded with uploadEyecatch is already attached to the note.
 * @param index Enable the table of contents.
 * Requires session cookies.
 */
export async function editNote(
  this: NoteAPIClient,
  {
    id,
    title,
    body,
    eyecatchImageKey,
    index = false,
  }: {
    id: string | number;
    title: string;
    body: string;
    eyecatchImageKey?: string | undefined;
    index?: boolean | undefined;
  },
): Promise<EditNoteResponse> {
  const data: Record<string, unknown> = {
    status: "published",
    name: title,
    free_body: body,
    index,
  };
  if (eyecatchImageKey !== undefined) data.eyecatch_image_key = eyecatchImageKey;

  return this.put<EditNoteResponse>(`${this.BASE_URL}/v1/text_notes/${pathSegment("id", id)}`, data);
}
