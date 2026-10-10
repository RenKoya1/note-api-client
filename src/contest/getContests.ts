import type { NoteAPIClient } from "../client";
import type { ContestsResponse } from "../types/contest/Contest";

/**
 * Lists contests. GET /v2/contests
 *
 * @param order Omit for newest first (currently open contests come first).
 *   "priority" sorts by note.com's featured priority, which puts old finished
 *   contests first.
 * @param group Passed through as the `group` query parameter.
 */
export async function getContests(
  this: NoteAPIClient,
  { order, group }: { order?: "priority" | (string & {}); group?: boolean } = {},
): Promise<ContestsResponse> {
  return this.get<ContestsResponse>(`${this.BASE_URL}/v2/contests`, { order, group });
}
