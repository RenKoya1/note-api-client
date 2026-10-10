/** One entry of GET /v2/categories */
export interface Category {
  /** Missing for "注目" and null for topic categories (business, lifestyle, design). */
  id?: number | null;
  name: string;
  /** Slug to pass to searchNotesByCategory (e.g. "tech"). Missing for "注目". */
  engName?: string;
  order: number;
  /** API URL of the category's note list; null for topic categories. */
  endpoint: string | null;
  url?: string;
}

export interface CategoriesResponse {
  categories: Category[];
}
