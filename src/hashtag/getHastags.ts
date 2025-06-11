import { NoteAPIClient } from "../client";

export async function getHashtags(this: NoteAPIClient, {}: {}): Promise<any> {
  return this.get<any>(`${this.BASE_URL}/v2/hashtags`, {});
}
