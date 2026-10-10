import type { NoteAPIClient } from "../client";
import type { PageMetadata } from "../types/metadata/Metadata";

/** Fetches the page metadata (title, OGP) of https://note.com/recommend. GET /v2/metadata/{url} */
export async function getRecommendMetadata(
  this: NoteAPIClient,
  _params: {} = {},
): Promise<PageMetadata> {
  return this.get<PageMetadata>(
    `${this.BASE_URL}/v2/metadata/${encodeURIComponent("https://note.com/recommend")}`,
  );
}
