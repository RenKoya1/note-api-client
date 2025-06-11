import { NoteAPIClient } from "../client";

export async function getMagazineDetail(
  this: NoteAPIClient,
  {
    key,
  }: {
    key: string;
  }
): Promise<any> {
  return this.get<any>(`${this.BASE_URL}/v1/magazines/${key}`, {});
}
