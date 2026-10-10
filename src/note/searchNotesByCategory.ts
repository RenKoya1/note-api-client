import type { NoteAPIClient } from "../client";
import { pageParam, pathSegment } from "../client/params";
import type { CategorySearchResponse } from "../types/note/CategoryNote";

/**
 * Lists notes in a category. GET /v1/categories/{category}
 *
 * @param category Category slug (`engName` from getCategories, e.g. "tech").
 *   An unknown slug returns `category_id: null` and no notes.
 * @param order "popular" (default), "new" or "hot". Sent as the `sort` query parameter.
 * @param page 1-based page number (10 notes per page). Use `next_page` / `last_page` to paginate.
 */
export async function searchNotesByCategory(
  this: NoteAPIClient,
  {
    category,
    page = 1,
    order = "popular",
  }: {
    category: string;
    page?: number;
    order?: "new" | "popular" | "hot";
    /** @deprecated note.com no longer filters categories by price; this option is ignored. */
    paid_only?: boolean;
  },
): Promise<CategorySearchResponse> {
  const data = await this.get<Omit<CategorySearchResponse, "is_last_page">>(
    `${this.BASE_URL}/v1/categories/${pathSegment("category", category)}`,
    { sort: order, page: pageParam(page) },
  );
  return { ...data, is_last_page: data.last_page };
}
