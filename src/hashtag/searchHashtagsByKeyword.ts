import type { NoteAPIClient } from "../client";
import { search, type SearchParams } from "../search/search";
import type { SearchHashtag } from "../types/hashtag/Hashtag";
import type { SearchCursors, SearchResult } from "../types/search/Search";

export interface HashtagKeywordSearchResponse extends SearchCursors {
  hashtags: SearchResult<SearchHashtag>;
}

/**
 * Searches hashtags by keyword. GET /v3/searches?context=hashtag
 *
 * @param size Results per request (max 20, default 10).
 * @param start Offset; pass `Number(res.hashtag_cursor)` to get the next page.
 */
export async function searchHashtagsByKeyword(
  this: NoteAPIClient,
  params: Omit<SearchParams, "sort">,
): Promise<HashtagKeywordSearchResponse> {
  return search<HashtagKeywordSearchResponse>(this, "hashtag", params);
}
