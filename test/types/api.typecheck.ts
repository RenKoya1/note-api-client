/**
 * Compile-time checks of the public API types. This file is never executed;
 * `npm run typecheck` fails if any assertion below stops holding.
 */
import {
  NoteAPIClient,
  NoteAPIError,
  type CategorySearchResponse,
  type FollowsResponse,
  type HashtagDetail,
  type NoteDetail,
  type NoteSearchResponse,
  type NoteStatus,
  type UserSearchResponse,
} from "../../src";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
function expectType<T extends true>(_: T) {}

export async function typeChecks(client: NoteAPIClient) {
  // Return types are inferred without annotations.
  const notes = await client.searchNotesByKeyword({ keyword: "AI", sort: "new" });
  expectType<Equal<typeof notes, NoteSearchResponse>>(true);
  const firstNote = notes.notes.contents[0];
  if (firstNote) {
    const status: NoteStatus = firstNote.status;
    void status;
    // eyecatch can be missing for text-only notes
    // @ts-expect-error string | null is not string
    const eyecatch: string = firstNote.eyecatch;
    void eyecatch;
  }

  expectType<Equal<Awaited<ReturnType<NoteAPIClient["getNoteDetail"]>>, NoteDetail>>(true);
  expectType<Equal<Awaited<ReturnType<NoteAPIClient["searchUsersByKeyword"]>>, UserSearchResponse>>(true);
  expectType<Equal<Awaited<ReturnType<NoteAPIClient["getFollowers"]>>, FollowsResponse>>(true);
  expectType<Equal<Awaited<ReturnType<NoteAPIClient["getHashtagDetail"]>>, HashtagDetail>>(true);
  expectType<Equal<Awaited<ReturnType<NoteAPIClient["searchNotesByCategory"]>>, CategorySearchResponse>>(true);
  expectType<Equal<Awaited<ReturnType<NoteAPIClient["getHashtags"]>>, never>>(true);

  // No method in the public surface returns `any`.
  type IsAny<T> = 0 extends 1 & T ? true : false;
  type Methods = {
    [K in keyof NoteAPIClient]: NoteAPIClient[K] extends (...args: any[]) => any ? K : never;
  }[keyof NoteAPIClient];
  type AnyReturning = {
    [K in Methods]: IsAny<Awaited<ReturnType<NoteAPIClient[K]>>> extends true ? K : never;
  }[Methods];
  // get/post/put/delete/request default to unknown, so this must be empty.
  expectType<Equal<AnyReturning, never>>(true);
  expectType<Equal<Awaited<ReturnType<typeof client.get>>, unknown>>(true);

  const comments = await client.getNoteComments({ key: "n", order: "oldest" });
  for (const c of comments.comments) {
    if (c.comment.type === "text") {
      const text: string = c.comment.value;
      void text;
    }
  }
  // @ts-expect-error unsupported comment order
  await client.getNoteComments({ key: "n", order: "popular" });

  // Parameters are checked.
  // @ts-expect-error keyword is required
  await client.searchNotesByKeyword({});
  // @ts-expect-error keyword must be a string
  await client.searchNotesByKeyword({ keyword: 1 });
  // @ts-expect-error unsupported sort
  await client.searchNotesByKeyword({ keyword: "a", sort: "oldest" });
  // @ts-expect-error users search has no sort
  await client.searchUsersByKeyword({ keyword: "a", sort: "new" });
  // @ts-expect-error unsupported order
  await client.searchNotesByHashtag({ hashtag: "AI", order: "recommend" });
  // @ts-expect-error unsupported order
  await client.searchNotesByCategory({ category: "tech", order: "like" });
  // @ts-expect-error key is required
  await client.getFollowers({});
  // @ts-expect-error id is required
  await client.draftDelete({});
  // @ts-expect-error title is required
  await client.createNote({ body: "<p>x</p>" });

  // Optional parameters accept explicit undefined (exactOptionalPropertyTypes-friendly).
  await client.searchNotesByKeyword({ keyword: "a", size: undefined, start: undefined, sort: undefined });
  await client.getFollowings({ key: "k", page: undefined, per: undefined });
  await client.getNoteLikes({ key: "n", page: undefined });
  await client.getContests({ order: undefined, group: undefined });
  new NoteAPIClient({ cookies: undefined, proxyUrl: undefined, timeout: undefined });

  // Errors carry typed metadata.
  try {
    await client.getCurrentUser();
  } catch (e) {
    if (e instanceof NoteAPIError) {
      const status: number | undefined = e.status;
      const code: string | undefined = e.code;
      void status;
      void code;
    }
  }
}
