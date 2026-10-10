import type { NoteAPIClient } from "../client";
import { NoteAPIError } from "../client/errors";
import type { NoteStatus, NoteType } from "../types/note/common";

export interface CreatedNote {
  id: number;
  key: string;
  type: NoteType;
  name: string;
  body: string | null;
  description: string | null;
  user_id: number;
  status: NoteStatus;
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
 * an extra draft_save request right after the note is created. If that
 * second request fails, the error message names the created note.
 * Requires session cookies.
 */
export async function createNote(
  this: NoteAPIClient,
  {
    title,
    body = "",
  }: {
    title: string;
    body?: string | undefined;
  },
): Promise<CreatedNote> {
  const created = await this.post<CreatedNote>(`${this.BASE_URL}/v1/text_notes`, {
    name: title,
    template_key: null,
  });
  if (body) {
    try {
      await this.saveDraft({ id: String(created.id), title, body });
    } catch (error) {
      // The draft exists at this point; tell the caller which one so it can
      // be retried or cleaned up (deleteNote).
      const e = error instanceof NoteAPIError ? error : undefined;
      throw new NoteAPIError({
        message: `note ${created.id} (${created.key}) was created but saving its body failed: ${(error as Error).message}`,
        method: e?.method ?? "POST",
        url: e?.url ?? `${this.BASE_URL}/v1/text_notes/draft_save`,
        status: e?.status,
        code: e?.code,
        body: e?.body,
        cause: error,
      });
    }
    return { ...created, body };
  }
  return created;
}
