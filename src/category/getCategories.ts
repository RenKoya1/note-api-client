import type { NoteAPIClient } from "../client";
import type { CategoriesResponse } from "../types/category/Category";

/** Lists note categories. GET /v2/categories */
export async function getCategories(
  this: NoteAPIClient,
  _params: {} = {},
): Promise<CategoriesResponse> {
  return this.get<CategoriesResponse>(`${this.BASE_URL}/v2/categories`);
}
