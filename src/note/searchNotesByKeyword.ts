import type { NoteAPIClient } from "../client";
import { search, type SearchParams } from "../search/search";
import type { Notes } from "../types/note/Notes";
import type { SearchCursors } from "../types/search/Search";

export interface NoteSearchResponse extends SearchCursors {
  notes: Notes;
}

/**
 * Searches notes by keyword. GET /v3/searches?context=note
 *
 * @param keyword Search phrase (space separated words are AND-ed).
 * @param size Results per request (max 20, default 10).
 * @param start Offset; pass `Number(res.note_cursor)` to get the next page.
 * @param sort "popular" (default), "new", "like" or "hot".
 */
export async function searchNotesByKeyword(
  this: NoteAPIClient,
  params: SearchParams,
): Promise<NoteSearchResponse> {
  return search<NoteSearchResponse>(this, "note", params);
}
