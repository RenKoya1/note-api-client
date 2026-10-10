import type { NoteAPIClient } from "../client";
import { pageParam } from "../client/params";
import type { MkitLayoutsResponse } from "../types/mkit/MkitLayout";

/**
 * Fetches curated note sections. GET /v3/mkit_layouts/json
 *
 * @param context Layout context. Only "category_challenge" is known to work;
 *   other values answer `not_found`.
 * @param page 1-based page number. Check `isLast` to stop paging.
 */
export async function getMkitLayouts(
  this: NoteAPIClient,
  {
    context = "category_challenge",
    page = 1,
  }: {
    context?: "category_challenge" | (string & {});
    page?: number;
  } = {},
): Promise<MkitLayoutsResponse> {
  return this.get<MkitLayoutsResponse>(`${this.BASE_URL}/v3/mkit_layouts/json`, {
    page: pageParam(page),
    context,
  });
}
