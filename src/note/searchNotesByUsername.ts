import { NoteAPIClient } from "../client";
import { Notes } from "../types/note/Notes";

export async function searchNotesByUsername(
  this: NoteAPIClient,
  {
    username,
    page = 1,
  }: {
    username: string;
    page?: number;
  }
) {
  const url = `${this.BASE_URL}/v2/creators/${encodeURIComponent(
    username
  )}/contents`;
  const params = {
    kind: "note",
    page,
  };

  return this.get<Notes>(url, params);
}
