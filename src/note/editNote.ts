import type { NoteAPIClient } from "../client";
import { pathSegment } from "../client/params";

/**
 * Publishes a note (or updates a published one). PUT /v1/text_notes/{id}
 *
 * @param id Numeric note id.
 * @param eyecatchImageKey Only sent when given, so an eyecatch uploaded with
 *   uploadEyecatch is not cleared.
 * @param index Enable the table of contents.
 * Requires session cookies.
 */
export async function editNote(
  this: NoteAPIClient,
  {
    id,
    title,
    body,
    eyecatchImageKey,
    index = false,
  }: {
    id: string | number;
    title: string;
    body: string;
    eyecatchImageKey?: string;
    index?: boolean;
  },
): Promise<any> {
  const data: Record<string, unknown> = {
    status: "published",
    name: title,
    free_body: body,
    index,
  };
  if (eyecatchImageKey !== undefined) data.eyecatch_image_key = eyecatchImageKey;

  return this.put<any>(`${this.BASE_URL}/v1/text_notes/${pathSegment("id", id)}`, data);
}
