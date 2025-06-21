import { Note } from "./Note";

export type Notes = {
  is_last_page: any;
  contents: Note[];
  top_search_contents: any[];
  total_count: number;
  rounded_total_count: number;
};
