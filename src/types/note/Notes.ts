import { Note } from "./Note";

/**
 * Notes search response from GET /v3/searches
 */
export type Notes = {
  is_last_page: boolean | null;
  contents: Note[];
  top_search_contents: Note[];
  total_count: number;
  rounded_total_count: number;
};
