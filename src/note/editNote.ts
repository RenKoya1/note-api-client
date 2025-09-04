import { NoteAPIClient } from "../client";

export async function editNote(
  this: NoteAPIClient,
  {
    articleId,
    title,
    body,
    eyecatchImageKey,
  }: {
    articleId: string;
    title: string;
    body: string;
    eyecatchImageKey?: string;
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v1/text_notes/${articleId}`;

  const data = {
    status: "published",
    name: title,
    free_body: body,
    eyecatch_image_key: eyecatchImageKey || null,
  };

  return this.put<any>(url, data);
}
