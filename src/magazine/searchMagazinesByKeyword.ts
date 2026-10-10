import type { NoteAPIClient } from "../client";
import { search, type SearchParams } from "../search/search";
import type { SearchMagazine } from "../types/magazine/Magazine";
import type { SearchCursors, SearchResult } from "../types/search/Search";

export interface MagazineSearchResponse extends SearchCursors {
  magazines: SearchResult<SearchMagazine>;
}

/**
 * Searches magazines by keyword. GET /v3/searches?context=magazine
 *
 * @param size Results per request (max 20, default 10).
 * @param start Offset; pass `Number(res.magazine_cursor)` to get the next page.
 */
export async function searchMagazinesByKeyword(
  this: NoteAPIClient,
  params: Omit<SearchParams, "sort">,
): Promise<MagazineSearchResponse> {
  return search<MagazineSearchResponse>(this, "magazine", params);
}
