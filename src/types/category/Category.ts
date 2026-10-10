/** One entry of GET /v2/categories */
export interface Category {
  /** Missing for the "注目" pseudo category. */
  id?: number;
  name: string;
  /** Slug to pass to searchNotesByCategory (e.g. "tech"). Missing for "注目". */
  engName?: string;
  order: number;
  endpoint: string;
  url?: string;
}

export interface CategoriesResponse {
  categories: Category[];
}
