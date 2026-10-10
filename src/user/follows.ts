import type { NoteAPIClient } from "../client";
import { pageParam, pathSegment } from "../client/params";
import type { FollowsResponse } from "../types/user/Follow";

/** note.com returns an empty list (not an error) when `per` exceeds this. */
export const MAX_FOLLOWS_PER_PAGE = 20;

export function getFollows(
  client: NoteAPIClient,
  kind: "followers" | "followings",
  { key, page = 1, per = MAX_FOLLOWS_PER_PAGE }: { key: string; page?: number | undefined; per?: number | undefined },
): Promise<FollowsResponse> {
  if (!Number.isInteger(per) || per < 1 || per > MAX_FOLLOWS_PER_PAGE) {
    throw new RangeError(
      `note-api-client: "per" must be an integer between 1 and ${MAX_FOLLOWS_PER_PAGE} (got ${per})`,
    );
  }
  return client.get<FollowsResponse>(
    `${client.BASE_URL}/v3/users/${pathSegment("key", key)}/${kind}`,
    { page: pageParam(page), per },
  );
}
