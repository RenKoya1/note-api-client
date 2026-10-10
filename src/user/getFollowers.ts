import type { NoteAPIClient } from "../client";
import type { FollowsResponse } from "../types/user/Follow";
import { getFollows } from "./follows";

/**
 * Lists users following the given user. GET /v3/users/{key}/followers
 *
 * @param key User key (the 32-char hex `key` of a user, not the urlname).
 *   Get it from `searchUserByUsername({ username }).key`.
 * @param per Users per page, 1-20 (default 20).
 */
export async function getFollowers(
  this: NoteAPIClient,
  params: { key: string; page?: number | undefined; per?: number | undefined },
): Promise<FollowsResponse> {
  return getFollows(this, "followers", params);
}
