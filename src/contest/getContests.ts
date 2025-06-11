import { NoteAPIClient } from "../client";

export async function getContests(
  this: NoteAPIClient,
  {
    order = "priority",
    group = false,
  }: {
    order?: string;
    group?: boolean;
  }
): Promise<any> {
  const url = `${this.BASE_URL}/v2/contests`;
  const params = {
    order: order,
    group: group,
  };

  return this.get<any>(url, params);
}
