import type { NoteAPIClient } from "../client";

export interface CreatedNote {
  id: number;
  key: string;
  type: string;
  name: string;
  body: string | null;
  description: string | null;
  user_id: number;
  status: string;
  price: number;
  publish_at: string | null;
  created_at: string;
  slug: string;
  can_publish: boolean;
  can_update: boolean;
  can_read: boolean;
}

/**
 * Creates a new draft note. POST /v1/text_notes
 *
 * note.com ignores the body on creation, so a non-empty `body` is saved with
 * an extra draft_save request right after the note is created.
 * Requires session cookies.
 */
export async function createNote(
  this: NoteAPIClient,
  {
    title,
    body = "",
  }: {
    title: string;
    body?: string;
  },
): Promise<CreatedNote> {
  const created = await this.post<CreatedNote>(`${this.BASE_URL}/v1/text_notes`, {
    name: title,
    template_key: null,
  });
  if (body) {
    await this.saveDraft({ id: String(created.id), title, body });
    return { ...created, body };
  }
  return created;
}
