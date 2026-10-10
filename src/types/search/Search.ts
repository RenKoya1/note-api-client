import { Cursor } from "../Cursor";

/** Sort order accepted by GET /v3/searches. */
export type SearchSort = "popular" | "new" | "like" | "hot";

/** `context` values accepted by GET /v3/searches. */
export type SearchContext =
  | "note"
  | "user"
  | "magazine"
  | "hashtag"
  | "circle"
  | "note_for_sale";

/** One result section of GET /v3/searches. Sections not requested via `context` are `{}`. */
export interface SearchResult<T> {
  is_last_page: boolean | null;
  contents: T[];
  top_search_contents: T[];
  total_count: number;
  rounded_total_count: number;
}

/**
 * Cursor fields present on every GET /v3/searches response. The next page
 * starts at `Number(<context>_cursor)` (pass it as `start`).
 */
export interface SearchCursors {
  note_cursor: string;
  user_cursor: string;
  magazine_cursor: string;
  hashtag_cursor: string;
  circle_cursor: string;
  note_for_sale_cursor: string;
  cursor: Cursor;
}
