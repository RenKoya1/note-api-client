import { NoteAPIClient } from "../client";

export async function getArticlesByUsername(
  this: NoteAPIClient,
  {
    username,
    page = 1,
  }: {
    username: string;
    page?: number;
  }
): Promise<any[]> {
  const url = `${this.BASE_URL}/v2/creators/${encodeURIComponent(
    username
  )}/contents`;
  const params = {
    kind: "note",
    page,
  };

  return this.get<any[]>(url, params);
}
