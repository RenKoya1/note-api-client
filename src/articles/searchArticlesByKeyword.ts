import { NoteAPIClient } from "../client";

export async function searchArticlesByKeyword(
  this: NoteAPIClient,
  {
    keyword,
    size = 10,
    start = 0,
  }: {
    keyword: string;
    size?: number;
    start?: number;
  }
): Promise<any> {
  const params = {
    q: keyword,
    size,
    start,
    context: "note",
  };

  return this.get<any>(`${this.BASE_URL}/v3/searches`, params);
}
