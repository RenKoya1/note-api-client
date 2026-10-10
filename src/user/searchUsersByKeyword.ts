import type { NoteAPIClient } from "../client";
import { search, type SearchParams } from "../search/search";
import type { SearchCursors, SearchResult } from "../types/search/Search";
import type { SearchUser } from "../types/user/SearchUser";

export interface UserSearchResponse extends SearchCursors {
  users: SearchResult<SearchUser>;
}

/**
 * Searches creators by keyword. GET /v3/searches?context=user
 *
 * @param size Results per request (max 20, default 10).
 * @param start Offset; pass `Number(res.user_cursor)` to get the next page.
 */
export async function searchUsersByKeyword(
  this: NoteAPIClient,
  params: Omit<SearchParams, "sort">,
): Promise<UserSearchResponse> {
  return search<UserSearchResponse>(this, "user", params);
}
