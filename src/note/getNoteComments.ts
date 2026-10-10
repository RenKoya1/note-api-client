import type { NoteAPIClient } from "../client";
import { pageParam, pathSegment } from "../client/params";
import type { NoteComment, NoteCommentNode, NoteCommentsResponse } from "../types/note/NoteComment";

/**
 * Fetches comments of a note in the current comment system.
 * GET /v3/notes/{key}/note_comments
 *
 * Notes with `NoteDetail.capabilities.note_comment === true` (most notes
 * published since late 2025) only expose their comments here; for older
 * notes use `getComments`.
 *
 * @param key Note key.
 * @param page 1-based page; follow `next_page` until it is null.
 * @param perPage Comments per page (default 10).
 * @param order "newest" (default) or "oldest".
 * @param parentKey Fetch replies to this root comment instead of root comments.
 */
export async function getNoteComments(
  this: NoteAPIClient,
  {
    key,
    page = 1,
    perPage = 10,
    order = "newest",
    parentKey,
  }: {
    key: string;
    page?: number | undefined;
    perPage?: number | undefined;
    order?: "newest" | "oldest" | undefined;
    parentKey?: string | undefined;
  },
): Promise<NoteCommentsResponse> {
  if (!Number.isInteger(perPage) || perPage < 1) {
    throw new RangeError(`note-api-client: "perPage" must be an integer >= 1 (got ${perPage})`);
  }
  const body = await this.requestBody<{
    data: NoteComment[];
    current_page: number;
    next_page: number | null;
    total_count: number;
  }>("GET", `${this.BASE_URL}/v3/notes/${pathSegment("key", key)}/note_comments`, {
    params: { page: pageParam(page), per_page: perPage, order, parent_key: parentKey },
  });
  return {
    comments: body.data,
    current_page: body.current_page,
    next_page: body.next_page,
    total_count: body.total_count,
  };
}

/** Converts a comment's rich text (`NoteComment.comment`) to plain text, one line per paragraph. */
export function noteCommentToText(node: NoteCommentNode): string {
  switch (node.type) {
    case "text":
      return node.value;
    case "element":
      if (node.tag_name === "br") return "\n";
      return node.children.map(noteCommentToText).join("");
    case "root":
      return node.children.map(noteCommentToText).join("\n");
  }
}
