import { NoteAPIClient } from "../client";
import { CategorySearchResponse } from "../types/note/CategoryNote";

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
): Promise<CategorySearchResponse> {
  const url = `${this.BASE_URL}/v1/categories/${category}`;
  const params = {
    note_intro_only: paid_only,
    order: order,
    page: page,
  };

  return this.get<CategorySearchResponse>(url, params);
}

