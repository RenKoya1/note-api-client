import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { NoteAPIError, noteCommentToText } from "../../src";
import { apiPath, mockClient } from "../helpers/mock";

const ok = (data: unknown = {}) => () => ({ body: { data } });

describe("search", () => {
  test("searchNotesByKeyword sends context/q/size/start and sort", async () => {
    const { client, requests } = mockClient(ok({ notes: {} }));
    await client.searchNotesByKeyword({ keyword: " AI ビジネス ", size: 20, start: 40, sort: "new" });
    assert.equal(apiPath(requests[0]), "/v3/searches");
    assert.deepEqual(requests[0].params, {
      context: "note",
      q: "AI ビジネス",
      size: 20,
      start: 40,
      sort: "new",
    });
  });

  test("defaults: size 10, start 0, no sort", async () => {
    const { client, requests } = mockClient(ok());
    await client.searchNotesByKeyword({ keyword: "AI" });
    assert.deepEqual(requests[0].params, { context: "note", q: "AI", size: 10, start: 0 });
  });

  test("users / magazines / hashtags use their context", async () => {
    const { client, requests } = mockClient(ok());
    await client.searchUsersByKeyword({ keyword: "a" });
    await client.searchMagazinesByKeyword({ keyword: "b", start: 3 });
    await client.searchHashtagsByKeyword({ keyword: "c", size: 5 });
    assert.deepEqual(
      requests.map((r) => [r.params!.context, r.params!.q, r.params!.size, r.params!.start]),
      [
        ["user", "a", 10, 0],
        ["magazine", "b", 10, 3],
        ["hashtag", "c", 5, 0],
      ],
    );
  });

  test("validates keyword, size and start", async () => {
    const { client, requests } = mockClient(ok());
    await assert.rejects(client.searchNotesByKeyword({ keyword: "  " }), TypeError);
    await assert.rejects(client.searchNotesByKeyword({ keyword: "a", size: 0 }), RangeError);
    await assert.rejects(client.searchNotesByKeyword({ keyword: "a", size: 1.5 }), RangeError);
    await assert.rejects(client.searchNotesByKeyword({ keyword: "a", start: -1 }), RangeError);
    assert.equal(requests.length, 0);
  });
});

describe("notes", () => {
  test("getNoteDetail encodes the key", async () => {
    const { client, requests } = mockClient(ok({ id: 1 }));
    await client.getNoteDetail({ key: "n1a0b26f944f4" });
    await client.getNoteDetail({ key: "a/b?c" });
    assert.equal(apiPath(requests[0]), "/v3/notes/n1a0b26f944f4");
    assert.equal(apiPath(requests[1]), "/v3/notes/a%2Fb%3Fc");
    await assert.rejects(client.getNoteDetail({ key: "" }), TypeError);
  });

  test("getComments uses the numeric id and pages with max_id", async () => {
    const { client, requests } = mockClient(ok({ comments: [] }));
    await client.getComments({ id: 88943926 });
    await client.getComments({ id: 88943926, maxId: 24676232 });
    assert.equal(apiPath(requests[0]), "/v1/note/88943926/comments");
    assert.deepEqual(requests[0].params, {});
    assert.deepEqual(requests[1].params, { max_id: 24676232 });
  });

  test("getNoteComments keeps the top-level paging fields", async () => {
    const comment = { key: "c1", comment: { type: "root", children: [] } };
    const { client, requests } = mockClient(() => ({
      body: { data: [comment], current_page: 2, next_page: 3, total_count: 57 },
    }));
    const res = await client.getNoteComments({ key: "nabc", page: 2, perPage: 5, order: "oldest" });
    assert.equal(apiPath(requests[0]), "/v3/notes/nabc/note_comments");
    assert.deepEqual(requests[0].params, { page: 2, per_page: 5, order: "oldest" });
    assert.deepEqual(res, { comments: [comment], current_page: 2, next_page: 3, total_count: 57 });

    await client.getNoteComments({ key: "nabc", parentKey: "c1" });
    assert.deepEqual(requests[1].params, { page: 1, per_page: 10, order: "newest", parent_key: "c1" });
    await assert.rejects(client.getNoteComments({ key: "nabc", perPage: 0 }), RangeError);
  });

  test("noteCommentToText flattens the rich text tree", () => {
    assert.equal(
      noteCommentToText({
        type: "root",
        children: [
          { type: "element", tag_name: "p", children: [{ type: "text", value: "こんにちは" }] },
          {
            type: "element",
            tag_name: "p",
            children: [
              { type: "text", value: "a" },
              { type: "element", tag_name: "br", children: [] },
              { type: "text", value: "b" },
            ],
          },
        ],
      }),
      "こんにちは\na\nb",
    );
  });

  test("getNoteLikes paginates", async () => {
    const { client, requests } = mockClient(ok({ likes: [] }));
    await client.getNoteLikes({ key: "nabc", page: 3 });
    assert.equal(apiPath(requests[0]), "/v3/notes/nabc/likes");
    assert.deepEqual(requests[0].params, { page: 3 });
    await assert.rejects(client.getNoteLikes({ key: "nabc", page: 0 }), RangeError);
  });

  test("searchNotesByUsername", async () => {
    const { client, requests } = mockClient(ok({ contents: [] }));
    await client.searchNotesByUsername({ username: "info", page: 2 });
    assert.equal(apiPath(requests[0]), "/v2/creators/info/contents");
    assert.deepEqual(requests[0].params, { kind: "note", page: 2 });
  });

  test("searchNotesByCategory sends sort (order is ignored by note.com) and aliases is_last_page", async () => {
    const { client, requests } = mockClient(
      ok({ category_id: 8, notes: [], first_page: true, next_page: 2, last_page: false }),
    );
    const res = await client.searchNotesByCategory({ category: "tech", order: "new", page: 2 });
    assert.equal(apiPath(requests[0]), "/v1/categories/tech");
    assert.deepEqual(requests[0].params, { sort: "new", page: 2 });
    assert.equal(res.last_page, false);
    assert.equal(res.is_last_page, false);
    await client.searchNotesByCategory({ category: "tech", paid_only: true });
    assert.deepEqual(requests[1].params, { sort: "popular", page: 1 });
  });

  test("searchNotesByHashtag strips # and encodes", async () => {
    const { client, requests } = mockClient(ok({ notes: [] }));
    await client.searchNotesByHashtag({ hashtag: "#生成AI", order: "new", paid_only: true });
    await client.searchNotesByHashtag({ hashtag: "＃日記" });
    assert.equal(apiPath(requests[0]), `/v3/hashtags/${encodeURIComponent("生成AI")}/notes`);
    assert.deepEqual(requests[0].params, { order: "new", paid_only: true, page: 1 });
    assert.equal(apiPath(requests[1]), `/v3/hashtags/${encodeURIComponent("日記")}/notes`);
    assert.deepEqual(requests[1].params, { order: "popular", paid_only: false, page: 1 });
  });
});

describe("users", () => {
  test("getFollowers hits /followers and getFollowings hits /followings", async () => {
    const { client, requests } = mockClient(ok({ follows: [] }));
    await client.getFollowers({ key: "k1" });
    await client.getFollowings({ key: "k1", page: 2, per: 5 });
    assert.equal(apiPath(requests[0]), "/v3/users/k1/followers");
    assert.deepEqual(requests[0].params, { page: 1, per: 20 });
    assert.equal(apiPath(requests[1]), "/v3/users/k1/followings");
    assert.deepEqual(requests[1].params, { page: 2, per: 5 });
  });

  test("per above 20 is rejected (note.com silently returns nothing)", async () => {
    const { client, requests } = mockClient(ok());
    await assert.rejects(client.getFollowers({ key: "k", per: 21 }), RangeError);
    await assert.rejects(client.getFollowings({ key: "k", per: 0 }), RangeError);
    assert.equal(requests.length, 0);
  });

  test("searchUserByUsername / getCurrentUser", async () => {
    const { client, requests } = mockClient(ok({ id: 1 }));
    await client.searchUserByUsername({ username: "info" });
    await client.getCurrentUser();
    assert.equal(apiPath(requests[0]), "/v2/creators/info");
    assert.equal(apiPath(requests[1]), "/v2/current_user");
  });

  test("signIn explains required_recaptcha", async () => {
    const { client, requests } = mockClient(() => ({
      status: 201,
      body: { error: { code: "required_recaptcha", message: "reCAPTCHAの認証を行い..." } },
    }));
    await assert.rejects(
      client.signIn({ login: "a", password: "b", g_recaptcha_response: "" }),
      (e: any) => {
        assert.ok(e instanceof NoteAPIError);
        assert.equal(e.code, "required_recaptcha");
        assert.match(e.message, /_note_session_v5/);
        return true;
      },
    );
    assert.equal(apiPath(requests[0]), "/v1/sessions/sign_in");
    assert.deepEqual(requests[0].json, {
      g_recaptcha_response: "",
      login: "a",
      password: "b",
      redirect_path: "https://note.com/",
    });
  });
});

describe("magazines / hashtags / misc", () => {
  test("magazine endpoints", async () => {
    const { client, requests } = mockClient(ok({}));
    await client.getMagazineDetail({ key: "m891c62a08b36" });
    await client.getMagazineNotes({ key: "m891c62a08b36", page: 2 });
    await client.searchMagazinesByUsername({ username: "info" });
    assert.equal(apiPath(requests[0]), "/v1/magazines/m891c62a08b36");
    assert.equal(apiPath(requests[1]), "/v1/magazines/m891c62a08b36/notes");
    assert.deepEqual(requests[1].params, { page: 2 });
    assert.equal(apiPath(requests[2]), "/v2/creators/info/contents");
    assert.deepEqual(requests[2].params, { kind: "magazine", page: 1 });
  });

  test("getHashtagDetail strips # and encodes", async () => {
    const { client, requests } = mockClient(ok({}));
    await client.getHashtagDetail({ hashtag: "#エッセイ" });
    assert.equal(apiPath(requests[0]), `/v2/hashtags/${encodeURIComponent("エッセイ")}`);
  });

  test("getHashtags rejects without a request (endpoint removed by note.com)", async () => {
    const { client, requests } = mockClient(ok());
    await assert.rejects(client.getHashtags(), (e: any) => e.code === "endpoint_removed");
    assert.equal(requests.length, 0);
  });

  test("no-argument methods can be called without arguments", async () => {
    const { client, requests } = mockClient(ok({}));
    await client.getCategories();
    await client.getContests();
    await client.getRecommendMetadata();
    await client.getMkitLayouts();
    assert.deepEqual(
      requests.map((r) => [apiPath(r), r.params ?? {}]),
      [
        ["/v2/categories", {}],
        ["/v2/contests", {}],
        ["/v2/metadata/https%3A%2F%2Fnote.com%2Frecommend", {}],
        ["/v3/mkit_layouts/json", { page: 1, context: "category_challenge" }],
      ],
    );
  });

  test("getContests passes order/group", async () => {
    const { client, requests } = mockClient(ok({}));
    await client.getContests({ order: "priority", group: false });
    assert.deepEqual(requests[0].params, { order: "priority", group: false });
  });
});

describe("write operations", () => {
  test("createNote creates then saves the body (note.com ignores body on create)", async () => {
    const { client, requests } = mockClient((req) =>
      apiPath(req) === "/v1/text_notes"
        ? { status: 201, body: { data: { id: 123, key: "nkey", body: null } } }
        : { status: 201, body: { data: { result: true } } },
    );
    const created = await client.createNote({ title: "T", body: "<p>hello</p>" });
    assert.equal(requests.length, 2);
    assert.equal(requests[0].method, "POST");
    assert.deepEqual(requests[0].json, { name: "T", template_key: null });
    assert.equal(apiPath(requests[1]), "/v1/text_notes/draft_save");
    assert.deepEqual(requests[1].params, { id: "123", is_temp_saved: true });
    assert.equal(requests[1].json.body, "<p>hello</p>");
    assert.equal(created.body, "<p>hello</p>");
    assert.equal(created.key, "nkey");
  });

  test("createNote names the created note when saving the body fails", async () => {
    const { client } = mockClient((req) =>
      apiPath(req) === "/v1/text_notes"
        ? { status: 201, body: { data: { id: 123, key: "nkey", body: null } } }
        : { status: 500, body: { error: "boom" } },
    );
    await assert.rejects(client.createNote({ title: "T", body: "<p>x</p>" }), (e: any) => {
      assert.ok(e instanceof NoteAPIError);
      assert.match(e.message, /note 123 \(nkey\) was created/);
      assert.equal(e.status, 500);
      return true;
    });
  });

  test("createNote with empty body makes one request", async () => {
    const { client, requests } = mockClient(() => ({ status: 201, body: { data: { id: 1 } } }));
    await client.createNote({ title: "T", body: "" });
    await client.createNote({ title: "T" });
    assert.equal(requests.length, 2);
  });

  test("saveDraft payload and params", async () => {
    const { client, requests } = mockClient(ok({ result: true }));
    await client.saveDraft({ id: 5, title: "T", body: "<p>abc</p><p>de</p>", isTempSaved: false, index: true });
    assert.deepEqual(requests[0].params, { id: "5" });
    assert.deepEqual(requests[0].json, {
      name: "T",
      body: "<p>abc</p><p>de</p>",
      body_length: 5,
      index: true,
      is_lead_form: false,
    });
    await assert.rejects(client.saveDraft({ id: "", title: "T", body: "" }), TypeError);
  });

  test("editNote publishes and only sends eyecatch_image_key when given", async () => {
    const { client, requests } = mockClient(ok({}));
    await client.editNote({ id: "9", title: "T", body: "<p>x</p>" });
    await client.editNote({ id: "9", title: "T", body: "<p>x</p>", eyecatchImageKey: "k", index: true });
    assert.equal(requests[0].method, "PUT");
    assert.equal(apiPath(requests[0]), "/v1/text_notes/9");
    assert.deepEqual(requests[0].json, { status: "published", name: "T", free_body: "<p>x</p>", index: false });
    assert.equal(requests[1].json.eyecatch_image_key, "k");
    assert.equal(requests[1].json.index, true);
  });

  test("deleteNote / draftDelete", async () => {
    const { client, requests } = mockClient(ok({ result: true }));
    await client.deleteNote({ id: 77 });
    await client.draftDelete({ id: 77 });
    assert.equal(requests[0].method, "DELETE");
    assert.equal(apiPath(requests[0]), "/v1/notes/77");
    assert.equal(apiPath(requests[1]), "/v1/text_notes/draft_delete");
    assert.deepEqual(requests[1].params, { id: "77" });
    assert.deepEqual(requests[1].json, { id: "77" });
    await assert.rejects(client.draftDelete({ id: undefined as any }), TypeError);
  });
});
