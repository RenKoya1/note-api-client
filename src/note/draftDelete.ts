import { NoteAPIClient } from "../client";

export async function draftDelete(
  this: NoteAPIClient,
  {
    id,
  }: {
    id?: string;
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v1/text_notes/draft_delete?id=${id}`;

  const data = {
    id: id,
  };

  return this.delete<any>(url, data);
}
