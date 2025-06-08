import { NoteAPIClient } from "../client";

export async function getArticleDetail(
  this: NoteAPIClient,
  {
    key,
  }: {
    key: string;
  }
): Promise<string> {
  return this.get<string>(`${this.BASE_URL}/v3/notes/${id}`, {});
}
