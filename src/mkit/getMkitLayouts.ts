import { NoteAPIClient } from "../client";

export async function getMkitLayouts(
  this: NoteAPIClient,
  {
    context,
    page = 1,
  }: {
    context: "category_challenge";
    page?: number;
  }
): Promise<any> {
  const params = {
    page: page,
    context: context,
  };

  return this.get<any>(`${this.BASE_URL}/v3/mkit_layouts/json`, params);
}
