import { NoteAPIClient } from "../client";

export async function searchNotesByCategory(
  this: NoteAPIClient,
  {
    category,
    page = 1,
    order = "popular",
    paid_only = false,
  }: {
    category: string;
    page?: number;
    order?: "new" | "popular" | "hot";
    paid_only?: boolean;
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v1/categories/${category}`;
  const params = {
    note_intro_only: paid_only,
    order: order,
    page: page,
  };

  return this.get<any>(url, params);
}
