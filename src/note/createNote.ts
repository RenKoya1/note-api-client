import { NoteAPIClient } from "../client";

export async function createNote(
  this: NoteAPIClient,
  {
    title,
    body,
  }: {
    title: string;
    body: string;
  }
) {
  const url = `${this.BASE_URL}/v1/text_notes`;
  const data = {
    body: body,
    name: title,
    template_key: null,
  };

  return this.post<any>(url, data);
}
