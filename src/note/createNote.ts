import { NoteAPIClient } from "../client";

export async function createNote(
  this: NoteAPIClient,
  {
    title,
    body,
  }: {
    title: string;
    body: string;
  }
) {
  const url = `${this.BASE_URL}/v1/text_notes`;
  const data = {
    body: body,
    name: title,
    template_key: null,
  };

  return this.post<{
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
  }>(url, data);
}
