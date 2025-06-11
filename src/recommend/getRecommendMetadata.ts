import { NoteAPIClient } from "../client";

export async function getRecommendMetadata(
  this: NoteAPIClient,
  {}: {}
): Promise<any> {
  return this.get<any>(
    `${this.BASE_URL}/v2/metadata/https%3A%2F%2Fnote.com%2Frecommend`,
    {}
  );
}
