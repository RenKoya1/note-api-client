/**
 * Live tests against https://note.com (read-only, no login).
 * Run with `npm run test:live`. They verify request parameters still take
 * effect and that responses match the exported types.
 */
import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NoteAPIError } from "../../src";
import { assertContract, liveClient, pause } from "../helpers/live";

// Stable fixtures: note.com official account and long-lived public content.
const NOTE_KEY = "n1a0b26f944f4";
const NOTE_ID = 88943926;
const OFFICIAL = "info";
const SMALL_CREATOR = "notepecora";
const MAGAZINE_KEY = "m891c62a08b36";

const client = liveClient();
afterEach(() => pause());

const isDescending = (dates: string[]) =>
  dates.every((d, i) => i === 0 || Date.parse(dates[i - 1]) >= Date.parse(d));

describe("search", () => {
  test("searchNotesByKeyword: shape, size cap, pagination", async (t) => {
    const first = await client.searchNotesByKeyword({ keyword: "AI", size: 5 });
    assertContract(t, first, "NoteSearchResponse");
    assert.equal(first.notes.contents.length, 5);
    assert.equal(first.note_cursor, "5");

    await pause();
    const second = await client.searchNotesByKeyword({
      keyword: "AI",
      size: 5,
      start: Number(first.note_cursor),
    });
    const firstIds = new Set(first.notes.contents.map((n) => n.id));
    assert.ok(second.notes.contents.every((n) => !firstIds.has(n.id)), "next page must not repeat");

    await pause();
    const capped = await client.searchNotesByKeyword({ keyword: "AI", size: 50 });
    assert.equal(capped.notes.contents.length, 20, "note.com caps size at 20");
  });

  test("searchNotesByKeyword: sort=new returns newest first", async (t) => {
    const res = await client.searchNotesByKeyword({ keyword: "日記", size: 20, sort: "new" });
    assertContract(t, res, "NoteSearchResponse");
    assert.ok(isDescending(res.notes.contents.map((n) => n.publish_at)));

    await pause();
    const liked = await client.searchNotesByKeyword({ keyword: "日記", size: 5, sort: "like" });
    assert.notDeepEqual(
      liked.notes.contents.map((n) => n.id),
      res.notes.contents.slice(0, 5).map((n) => n.id),
    );
  });

  test("searchUsersByKeyword", async (t) => {
    const res = await client.searchUsersByKeyword({ keyword: "AI", size: 20 });
    assertContract(t, res, "UserSearchResponse");
    assert.equal(res.users.contents.length, 20);
    assert.ok(res.users.contents.every((u) => typeof u.urlname === "string"));
  });

  test("searchMagazinesByKeyword", async (t) => {
    const res = await client.searchMagazinesByKeyword({ keyword: "AI", size: 10 });
    assertContract(t, res, "MagazineSearchResponse");
    assert.equal(res.magazines.contents.length, 10);
    assert.ok(res.magazines.contents.every((m) => m.key.startsWith("m")));
  });

  test("searchHashtagsByKeyword", async (t) => {
    const res = await client.searchHashtagsByKeyword({ keyword: "AI", size: 10 });
    assertContract(t, res, "HashtagKeywordSearchResponse");
    assert.ok(res.hashtags.contents.length > 0);
    assert.ok(res.hashtags.contents.every((h) => h.name.startsWith("#")));
  });
});

describe("notes", () => {
  test("getNoteDetail", async (t) => {
    const note = await client.getNoteDetail({ key: NOTE_KEY });
    assertContract(t, note, "NoteDetail");
    assert.equal(note.id, NOTE_ID);
    assert.equal(note.key, NOTE_KEY);
    assert.ok(note.body.length > 0);
  });

  test("getComments", async (t) => {
    const res = await client.getComments({ id: NOTE_ID });
    assertContract(t, res, "CommentsResponse");
    assert.ok(res.comments.length > 0);
  });

  test("getNoteLikes: 50 per page, empty past the end", async (t) => {
    const page1 = await client.getNoteLikes({ key: NOTE_KEY });
    assertContract(t, page1, "NoteLikesResponse");
    assert.equal(page1.likes.length, 50);
    assert.ok(page1.extra_fields.like_count >= 50);

    await pause();
    const last = Math.ceil(page1.extra_fields.like_count / 50) + 1;
    const beyond = await client.getNoteLikes({ key: NOTE_KEY, page: last });
    assert.equal(beyond.likes.length, 0);
  });

  test("searchNotesByUsername: pagination", async (t) => {
    const p1 = await client.searchNotesByUsername({ username: OFFICIAL });
    assertContract(t, p1, "UserNotesResponse");
    assert.ok(p1.totalCount > 0);
    assert.equal(p1.isLastPage, false);

    await pause();
    const p2 = await client.searchNotesByUsername({ username: OFFICIAL, page: 2 });
    assertContract(t, p2, "UserNotesResponse");
    assert.notEqual(p2.contents[0].id, p1.contents[0].id);
    assert.ok(p1.contents.every((n) => n.user.urlname === OFFICIAL));
  });

  test("searchNotesByCategory: sort is honored", async (t) => {
    const newest = await client.searchNotesByCategory({ category: "tech", order: "new" });
    assertContract(t, newest, "CategorySearchResponse");
    assert.equal(newest.category_id, 8);
    assert.equal(newest.notes.length, 10);
    assert.equal(newest.is_last_page, newest.last_page);
    assert.ok(isDescending(newest.notes.map((n) => n.publish_at)), "order=new must be newest first");

    await pause();
    const popular = await client.searchNotesByCategory({ category: "tech", order: "popular" });
    assertContract(t, popular, "CategorySearchResponse");
    assert.notDeepEqual(popular.notes.map((n) => n.id), newest.notes.map((n) => n.id));

    await pause();
    const page2 = await client.searchNotesByCategory({ category: "tech", order: "new", page: 2 });
    assert.equal(page2.next_page, 3);
    assert.notEqual(page2.notes[0].id, newest.notes[0].id);
  });

  test("searchNotesByCategory: unknown category", async () => {
    const res = await client.searchNotesByCategory({ category: "no-such-category" });
    assert.equal(res.category_id, null);
    assert.deepEqual(res.notes, []);
  });

  test("searchNotesByHashtag: order and paid_only", async (t) => {
    const paid = await client.searchNotesByHashtag({ hashtag: "#AI", order: "new", paid_only: true });
    assertContract(t, paid, "HashtagSearchResponse");
    assert.ok(paid.notes.length > 0);
    assert.ok(paid.notes.every((n) => n.price > 0), "paid_only must only return paid notes");
    assert.ok(isDescending(paid.notes.map((n) => n.publish_at)));

    await pause();
    const popular = await client.searchNotesByHashtag({ hashtag: "AI" });
    assertContract(t, popular, "HashtagSearchResponse");
    assert.equal(popular.notes.length, 50);
    assert.equal(popular.next_page, 2);
  });
});

describe("users", () => {
  test("searchUserByUsername", async (t) => {
    const user = await client.searchUserByUsername({ username: OFFICIAL });
    assertContract(t, user, "User");
    assert.equal(user.urlname, OFFICIAL);
    assert.match(user.key, /^[0-9a-f]{32}$/);
  });

  test("getFollowers / getFollowings return the right direction", async (t) => {
    const user = await client.searchUserByUsername({ username: SMALL_CREATOR });
    await pause();
    const followers = await client.getFollowers({ key: user.key });
    assertContract(t, followers, "FollowsResponse");
    await pause();
    const followings = await client.getFollowings({ key: user.key });
    assertContract(t, followings, "FollowsResponse");

    // Counts can move a little between requests.
    assert.ok(Math.abs(followers.total_count - user.followerCount) <= 3, "followers total");
    assert.ok(Math.abs(followings.total_count - user.followingCount) <= 3, "followings total");
    assert.equal(followers.follows.length, Math.min(20, followers.total_count));

    await pause();
    const p2 = await client.getFollowers({ key: user.key, page: 2, per: 5 });
    assert.equal(p2.follows.length, 5);
  });

  test("getCurrentUser without cookies fails", async () => {
    await assert.rejects(client.getCurrentUser(), (e: any) => {
      assert.ok(e instanceof NoteAPIError);
      assert.ok(e.status === 401 || e.status === 404, `status ${e.status}`);
      return true;
    });
  });
});

describe("magazines", () => {
  test("getMagazineDetail", async (t) => {
    const mag = await client.getMagazineDetail({ key: MAGAZINE_KEY });
    assertContract(t, mag, "MagazineDetail");
    assert.equal(mag.key, MAGAZINE_KEY);
  });

  test("getMagazineNotes: 100 per page", async (t) => {
    const p1 = await client.getMagazineNotes({ key: MAGAZINE_KEY });
    assertContract(t, p1, "MagazineNotesResponse");
    assert.equal(p1.notes.length, 100);
    assert.equal(p1.next_page, 2);
    assert.equal(p1.prev_page, null);

    await pause();
    const p2 = await client.getMagazineNotes({ key: MAGAZINE_KEY, page: 2 });
    assert.equal(p2.prev_page, 1);
    assert.notEqual(p2.notes[0].key, p1.notes[0].key);
  });

  test("searchMagazinesByUsername", async (t) => {
    const res = await client.searchMagazinesByUsername({ username: OFFICIAL });
    assertContract(t, res, "CreatorMagazinesResponse");
    assert.ok(res.totalCount > 0);
    assert.ok(res.contents.length > 0);
    assert.ok(res.contents.every((m) => m.key.startsWith("m")));
  });
});

describe("hashtags, categories and misc", () => {
  test("getHashtagDetail", async (t) => {
    const res = await client.getHashtagDetail({ hashtag: "#エッセイ" });
    assertContract(t, res, "HashtagDetail");
    assert.equal(res.name, "#エッセイ");
    assert.ok(res.count > 0);
    assert.ok(res.relatedHashtags.length > 0);
  });

  test("getCategories", async (t) => {
    const res = await client.getCategories();
    assertContract(t, res, "CategoriesResponse");
    assert.ok(res.categories.some((c) => c.engName === "tech"));
  });

  test("searchNotesByCategory works for topic categories (endpoint: null)", async (t) => {
    const res = await client.searchNotesByCategory({ category: "business", order: "new" });
    assertContract(t, res, "CategorySearchResponse");
    assert.equal(typeof res.category_id, "number");
    assert.ok(res.notes.length > 0);
  });

  test("getContests", async (t) => {
    const res = await client.getContests();
    assertContract(t, res, "ContestsResponse");
    assert.ok(res.contests.length > 0);
  });

  test("getRecommendMetadata", async (t) => {
    const res = await client.getRecommendMetadata();
    assertContract(t, res, "PageMetadata");
    assert.match(res.title, /note/);
  });

  test("getMkitLayouts", async (t) => {
    const res = await client.getMkitLayouts();
    assertContract(t, res, "MkitLayoutsResponse");
    assert.equal(res.page, 1);
    assert.ok(res.sections.length > 0);
  });

  test("getHashtags is gone upstream", async () => {
    await assert.rejects(client.getHashtags(), (e: any) => e.code === "endpoint_removed");
  });
});

describe("errors", () => {
  test("unknown note key", async () => {
    await assert.rejects(client.getNoteDetail({ key: "nnotexist000" }), (e: any) => {
      assert.ok(e instanceof NoteAPIError);
      assert.equal(e.status, 400);
      assert.equal(e.code, "bad_request");
      return true;
    });
  });

  test("unknown creator", async () => {
    await assert.rejects(client.searchUserByUsername({ username: "zz_no_such_user_zz" }), (e: any) => {
      assert.equal(e.status, 404);
      assert.match(e.message, /リソースが見つかりません/);
      return true;
    });
  });

  test("unknown hashtag", async () => {
    await assert.rejects(client.getHashtagDetail({ hashtag: "存在しないハッシュタグzzqq" }), (e: any) => {
      assert.equal(e.status, 404);
      return true;
    });
  });

  test("comments of an unknown note (200 with error body)", async () => {
    await assert.rejects(client.getComments({ id: 1 }), (e: any) => {
      assert.equal(e.status, 200);
      assert.equal(e.code, "not_found");
      return true;
    });
  });
});
