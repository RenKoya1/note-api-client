import { NoteAPIClient } from "../client";
import { NoteDetail } from "../types/note/NoteDetail";

export async function getNoteDetail(
  this: NoteAPIClient,
  {
    key,
  }: {
    key: string;
  }
) {
  return this.get<NoteDetail>(`${this.BASE_URL}/v3/notes/${key}`, {});
}
