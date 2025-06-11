import { NoteAPIClient } from "../client";

export async function searchNotesByCategory(
  this: NoteAPIClient,
  {
    category,
    page = 1,
  }: {
    category: string;
    page?: number;
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v1/categories/${category}`;
  const params = {
    note_intro_only: "true",
    // sort: "new",
    page: page,
  };

  return this.get<any>(url, params);
}
