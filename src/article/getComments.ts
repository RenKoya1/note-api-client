import { NoteAPIClient } from "../client";

export async function getComments(
  this: NoteAPIClient,
  {
    id,
  }: {
    id: string;
  }
): Promise<any> {
  return this.get<any>(`${this.BASE_URL}/v1/note/${id}/comments`, {});
}
