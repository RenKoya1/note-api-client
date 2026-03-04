import { NoteAPIClient } from "../client";

export async function saveDraft(
  this: NoteAPIClient,
  {
    id,
    title,
    body,
    isTempSaved = true,
    index = false,
  }: {
    id?: string;
    title: string;
    body: string;
    isTempSaved?: boolean;
    index?: boolean;
  },
): Promise<any> {
  const url = `${this.BASE_URL}/v1/text_notes/draft_save?id=${id}&is_temp_saved=${isTempSaved}`;

  const data = {
    name: title,
    body,
    body_length: body.replace(/<[^>]*>/g, "").length,
    index,
    is_lead_form: false,
  };

  return this.post<any>(url, data);
}
