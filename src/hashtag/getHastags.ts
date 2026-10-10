import type { NoteAPIClient } from "../client";
import { NoteAPIError } from "../client/errors";

/**
 * @deprecated note.com removed the hashtag list endpoint (GET /v2/hashtags now
 * returns 404). Use `searchHashtagsByKeyword` or `getHashtagDetail`
 * (`relatedHashtags`) instead. This method always rejects.
 */
export async function getHashtags(this: NoteAPIClient, _params: {} = {}): Promise<never> {
  throw new NoteAPIError({
    message:
      "getHashtags is no longer available: note.com removed GET /v2/hashtags. Use searchHashtagsByKeyword or getHashtagDetail instead.",
    method: "GET",
    url: `${this.BASE_URL}/v2/hashtags`,
    status: 404,
    code: "endpoint_removed",
  });
}
