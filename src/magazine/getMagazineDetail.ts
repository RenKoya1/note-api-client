import type { NoteAPIClient } from "../client";
import { pathSegment } from "../client/params";
import type { MagazineDetail } from "../types/magazine/Magazine";

/**
 * Fetches a magazine. GET /v1/magazines/{key}
 *
 * @param key Magazine key such as "m891c62a08b36".
 */
export async function getMagazineDetail(
  this: NoteAPIClient,
  { key }: { key: string },
): Promise<MagazineDetail> {
  return this.get<MagazineDetail>(`${this.BASE_URL}/v1/magazines/${pathSegment("key", key)}`);
}
