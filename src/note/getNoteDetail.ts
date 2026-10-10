import type { NoteAPIClient } from "../client";
import { pathSegment } from "../client/params";
import type { NoteDetail } from "../types/note/NoteDetail";

/**
 * Fetches a note. GET /v3/notes/{key}
 *
 * @param key Note key such as "n1a0b26f944f4" (the last segment of the note URL).
 *   Drafts are only returned for their author (requires session cookies).
 */
export async function getNoteDetail(
  this: NoteAPIClient,
  { key }: { key: string },
): Promise<NoteDetail> {
  return this.get<NoteDetail>(`${this.BASE_URL}/v3/notes/${pathSegment("key", key)}`);
}
