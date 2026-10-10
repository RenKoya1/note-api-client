import type { NoteAPIClient } from "../client";
import { pageParam, pathSegment } from "../client/params";
import type { CreatorMagazinesResponse } from "../types/magazine/Magazine";

/**
 * Lists magazines shown on a creator's profile, including jointly managed
 * ones owned by other users. GET /v2/creators/{urlname}/contents?kind=magazine
 *
 * @param username Creator urlname.
 * @param page 1-based page number. Check `isLastPage` to stop paging.
 */
export async function searchMagazinesByUsername(
  this: NoteAPIClient,
  { username, page = 1 }: { username: string; page?: number | undefined },
): Promise<CreatorMagazinesResponse> {
  return this.get<CreatorMagazinesResponse>(
    `${this.BASE_URL}/v2/creators/${pathSegment("username", username)}/contents`,
    { kind: "magazine", page: pageParam(page) },
  );
}
