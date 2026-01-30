import { NoteAPIClient } from "../client";
import { UserNotesResponse } from "../types/note/UserNote";

export async function searchNotesByUsername(
  this: NoteAPIClient,
  {
    username,
    page = 1,
  }: {
    username: string;
    page?: number;
  }
): Promise<UserNotesResponse> {
  const url = `${this.BASE_URL}/v2/creators/${encodeURIComponent(
    username
  )}/contents`;
  const params = {
    kind: "note",
    page,
  };

  return this.get<UserNotesResponse>(url, params);
}

