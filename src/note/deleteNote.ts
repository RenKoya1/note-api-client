import type { NoteAPIClient } from "../client";
import { pathSegment } from "../client/params";

/**
 * Deletes a note (published or draft). DELETE /v1/notes/{id}
 *
 * @param id Numeric note id.
 * Requires session cookies.
 */
export async function deleteNote(
  this: NoteAPIClient,
  { id }: { id: string | number },
): Promise<{ result: boolean }> {
  return this.delete<{ result: boolean }>(`${this.BASE_URL}/v1/notes/${pathSegment("id", id)}`);
}
