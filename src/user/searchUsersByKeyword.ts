import { NoteAPIClient } from "../client";
import { Cursor } from "../types/Cursor";
import { User } from "../types/user/User";
import { UserSimple } from "../types/user/UserSimple";

export async function searchUsersByKeyword(
  this: NoteAPIClient,
  {
    keyword,
    size = 10,
    start = 0,
  }: {
    keyword: string;
    size?: number;
    start?: number;
  }
): Promise<any> {
  const params = {
    q: keyword,
    size,
    start,
    context: "user",
  };

  return this.get<{
    cursor: Cursor;
    users: {
      is_last_page: boolean;
      content: UserSimple[];
      top_search_contents: any[];
      total_count: number;
      rounded_total_count: number;
    };
  }>(`${this.BASE_URL}/v3/searches`, params);
}
