import type { NoteAPIClient } from "../client";
import { requireParam } from "../client/params";
import type { SearchContext, SearchSort } from "../types/search/Search";

export interface SearchParams {
  keyword: string;
  /** Results per request. note.com caps this at 20. */
  size?: number;
  /** Offset of the first result. Use `Number(response.<context>_cursor)` for the next page. */
  start?: number;
  sort?: SearchSort;
}

/** Shared implementation of GET /v3/searches. */
export function search<T>(
  client: NoteAPIClient,
  context: SearchContext,
  { keyword, size = 10, start = 0, sort }: SearchParams,
): Promise<T> {
  const q = requireParam("keyword", keyword);
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError(`note-api-client: "size" must be an integer >= 1 (got ${size})`);
  }
  if (!Number.isInteger(start) || start < 0) {
    throw new RangeError(`note-api-client: "start" must be an integer >= 0 (got ${start})`);
  }
  return client.get<T>(`${client.BASE_URL}/v3/searches`, {
    context,
    q,
    size,
    start,
    sort,
  });
}
