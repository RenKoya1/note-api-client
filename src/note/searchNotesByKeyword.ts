import { NoteAPIClient } from "../client";
import { Cursor } from "../types/Cursor";
import { Notes } from "../types/note/Notes";

export async function searchNotesByKeyword(
  this: NoteAPIClient,
  {
    keyword,
    size = 10,
    start = 0,
  }: {
    keyword: string;
    size?: number;
    start?: number;
  }
) {
  const params = {
    q: keyword,
    size,
    start,
    context: "note",
  };

  return this.get<{
    notes: Notes;
    cursor: Cursor;
  }>(`${this.BASE_URL}/v3/searches`, params);
}
