import type { NoteAPIClient } from "../client";
import { pageParam, pathSegment } from "../client/params";
import type { UserNotesResponse } from "../types/note/UserNote";

/**
 * Lists notes published by a creator. GET /v2/creators/{urlname}/contents?kind=note
 *
 * @param username Creator urlname (e.g. "info" for https://note.com/info).
 * @param page 1-based page number. Check `isLastPage` to stop paging.
 */
export async function searchNotesByUsername(
  this: NoteAPIClient,
  { username, page = 1 }: { username: string; page?: number },
): Promise<UserNotesResponse> {
  return this.get<UserNotesResponse>(
    `${this.BASE_URL}/v2/creators/${pathSegment("username", username)}/contents`,
    { kind: "note", page: pageParam(page) },
  );
}
