import { NoteAPIClient } from "../client";

export async function getArticleDetail(
  this: NoteAPIClient,
  {
    key,
  }: {
    key: string;
  }
): Promise<any[]> {
  return this.get<any[]>(`${this.BASE_URL}/v3/notes/${key}`, {});
}
