import { NoteAPIClient } from "../client";

export async function saveDraft(
  this: NoteAPIClient,
  {
    id,
    name,
    body,
    isTempSaved = true,
  }: {
    id?: string;
    name: string;
    body: string;
    isTempSaved?: boolean;
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v1/text_notes/draft_save?id=${id}&is_temp_saved=${isTempSaved}`;

  const data = {
    name,
    body,
    body_length: body.replace(/<[^>]*>/g, "").length,
    index: false,
    is_lead_form: false,
  };

  return this.post<any>(url, data);
}
