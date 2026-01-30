import { NoteAPIClient } from "../client";
import { CommentsResponse } from "../types/note/Comment";

export async function getComments(
  this: NoteAPIClient,
  {
    id,
  }: {
    id: string;
  }
): Promise<CommentsResponse> {
  return this.get<CommentsResponse>(`${this.BASE_URL}/v1/note/${id}/comments`, {});
}

