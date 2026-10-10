/**
 * Wide contract sweep: checks responses for many different keywords,
 * categories, hashtags, notes and creators against the exported types.
 * Fixed fixtures miss nullable fields (users without a nickname, limited
 * notes without a body, magazines without a cover, ...); this catches them.
 *
 * ~150 requests, a few minutes. Runs only with NOTE_LIVE_SWEEP=1
 * (enabled in the weekly "live api check" workflow).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkContract } from "../helpers/contract";
import { liveClient, pause } from "../helpers/live";

const skip = process.env.NOTE_LIVE_SWEEP === "1" ? false : "NOTE_LIVE_SWEEP is not 1";

test("contract sweep over varied live data", { skip, timeout: 30 * 60_000 }, async (t) => {
  const client = liveClient();
  const errors = new Map<string, string>();
  const extra = new Map<string, string>();
  const failed: string[] = [];

  async function check(label: string, typeName: string, request: () => Promise<unknown>) {
    try {
      const result = checkContract(await request(), typeName);
      for (const e of result.errors) if (!errors.has(e)) errors.set(e, label);
      for (const e of result.extra) if (!extra.has(e)) extra.set(e, label);
    } catch (e) {
      // Transient failures (timeouts, rate limits) are reported, not fatal.
      failed.push(`${label}: ${(e as Error).message}`);
    }
    await pause(250);
  }

  const keywords = ["料理", "投資", "エッセイ", "子育て", "副業", "小説", "ゲーム", "猫", "英語", "短歌"];
  for (const keyword of keywords) {
    await check(`notes ${keyword}`, "NoteSearchResponse", () =>
      client.searchNotesByKeyword({ keyword, size: 20, sort: "new" }),
    );
    await check(`users ${keyword}`, "UserSearchResponse", () =>
      client.searchUsersByKeyword({ keyword, size: 20 }),
    );
    await check(`magazines ${keyword}`, "MagazineSearchResponse", () =>
      client.searchMagazinesByKeyword({ keyword, size: 20 }),
    );
    await check(`hashtags ${keyword}`, "HashtagKeywordSearchResponse", () =>
      client.searchHashtagsByKeyword({ keyword, size: 20 }),
    );
  }

  const { categories } = await client.getCategories();
  for (const category of categories.map((c) => c.engName).filter((c): c is string => !!c)) {
    await check(`category ${category}`, "CategorySearchResponse", () =>
      client.searchNotesByCategory({ category, order: "new" }),
    );
  }

  for (const hashtag of ["毎日note", "読書感想文", "イラスト", "生成AI"]) {
    await check(`hashtag ${hashtag}`, "HashtagSearchResponse", () =>
      client.searchNotesByHashtag({ hashtag, order: "new" }),
    );
    await check(`hashtag detail ${hashtag}`, "HashtagDetail", () => client.getHashtagDetail({ hashtag }));
  }

  const samples = [
    ...(await client.searchNotesByKeyword({ keyword: "日記", size: 20, sort: "new" })).notes.contents,
    ...(await client.searchNotesByKeyword({ keyword: "メンバーシップ", size: 20 })).notes.contents,
  ].slice(0, 30);
  for (const note of samples) {
    await check(`detail ${note.key}`, "NoteDetail", () => client.getNoteDetail({ key: note.key }));
    await check(`likes ${note.key}`, "NoteLikesResponse", () => client.getNoteLikes({ key: note.key }));
    if (note.comment_count > 0) {
      await check(`comments ${note.id}`, "CommentsResponse", () => client.getComments({ id: note.id }));
    }
  }

  const urlnames = [...new Set(samples.map((n) => n.user.urlname))].slice(0, 10);
  for (const username of urlnames) {
    await check(`creator ${username}`, "User", () => client.searchUserByUsername({ username }));
    await check(`creator notes ${username}`, "UserNotesResponse", () =>
      client.searchNotesByUsername({ username }),
    );
    await check(`creator magazines ${username}`, "CreatorMagazinesResponse", () =>
      client.searchMagazinesByUsername({ username }),
    );
  }
  if (urlnames[0]) {
    const user = await client.searchUserByUsername({ username: urlnames[0] });
    await check("followers", "FollowsResponse", () => client.getFollowers({ key: user.key }));
    await check("followings", "FollowsResponse", () => client.getFollowings({ key: user.key }));
  }

  const magazines = await client.searchMagazinesByKeyword({ keyword: "定期購読", size: 8 });
  for (const magazine of magazines.magazines.contents) {
    await check(`magazine ${magazine.key}`, "MagazineDetail", () =>
      client.getMagazineDetail({ key: magazine.key }),
    );
    await check(`magazine notes ${magazine.key}`, "MagazineNotesResponse", () =>
      client.getMagazineNotes({ key: magazine.key }),
    );
  }

  if (failed.length) t.diagnostic(`requests that failed (ignored): ${failed.join(" | ")}`);
  if (extra.size) {
    t.diagnostic(`undeclared fields: ${[...extra].map(([e, label]) => `${e} (${label})`).join(", ")}`);
  }
  assert.deepEqual(
    [...errors].map(([e, label]) => `${e} (${label})`),
    [],
    "live responses do not match the exported types",
  );
});
