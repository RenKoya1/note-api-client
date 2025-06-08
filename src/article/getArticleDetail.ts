import { NoteAPIClient } from "../client";

export async function getArticleDetail(
  this: NoteAPIClient,
  {
    id,
  }: {
    id: string;
  }
): Promise<string> {
  return this.get<string>(`${this.BASE_URL}/v3/notes/${id}`, {});
}
