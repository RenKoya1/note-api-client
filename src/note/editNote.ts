import { NoteAPIClient } from "../client";

export async function editNote(
  this: NoteAPIClient,
  {
    id,
    title,
    body,
    eyecatchImageKey,
    index = false,
  }: {
    id: string;
    title: string;
    body: string;
    eyecatchImageKey?: string;
    index?: boolean;
  },
): Promise<any> {
  const url = `${this.BASE_URL}/v1/text_notes/${id}`;

  const data = {
    status: "published",
    name: title,
    free_body: body,
    eyecatch_image_key: eyecatchImageKey || null,
    index,
  };

  return this.put<any>(url, data);
}
