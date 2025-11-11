import { NoteAPIClient } from "../client";

export async function deleteNote(
  this: NoteAPIClient,
  {
    id,
  }: {
    id: string;
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v1/notes/${id}`;
  return this.delete<any>(url);
}
