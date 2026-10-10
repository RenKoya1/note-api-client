import type { NoteAPIClient } from "../client";
import { normalizeHashtag } from "../client/params";
import type { HashtagDetail } from "../types/hashtag/Hashtag";

/**
 * Fetches hashtag info (usage count and related hashtags). GET /v2/hashtags/{hashtag}
 *
 * @param hashtag Hashtag with or without the leading "#".
 */
export async function getHashtagDetail(
  this: NoteAPIClient,
  { hashtag }: { hashtag: string },
): Promise<HashtagDetail> {
  return this.get<HashtagDetail>(
    `${this.BASE_URL}/v2/hashtags/${encodeURIComponent(normalizeHashtag(hashtag))}`,
  );
}
