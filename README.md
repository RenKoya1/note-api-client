# note-api-client

[![Version badge](https://img.shields.io/github/v/release/RenKoya1/note-api-client?include_prereleases)](https://github.com/RenKoya1/note-api-client)
[![npm version](https://img.shields.io/npm/v/note-api-client)](https://www.npmjs.com/package/note-api-client)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**note-api-client** is a fully typed Node.js / TypeScript client for the (unofficial) **note.com API**:
search notes, users, magazines and hashtags, read note details, comments and likes, and create,
save, publish and delete your own notes.

- Every response is typed, and the types are checked against the live API by the test suite
- No `any` in the public API; works with `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- Errors are thrown as `NoteAPIError` with `status`, `code` and the raw `body`
- Optional proxy support and a cookie jar that keeps your session alive

> note.com does not publish an official API. Endpoints can change at any time; run
> `npm run test:live` to check that everything still works.

## Installation

```sh
npm install note-api-client
```

## Quick start

```ts
import { NoteAPIClient } from "note-api-client";

const client = new NoteAPIClient();

const res = await client.searchNotesByKeyword({ keyword: "TypeScript", sort: "new" });
for (const note of res.notes.contents) {
  console.log(note.name, note.user.nickname, note.like_count);
}

const detail = await client.getNoteDetail({ key: "n1a0b26f944f4" });
console.log(detail.body); // null when you cannot read it (membership / magazine-only notes)
```

## Client options

```ts
const client = new NoteAPIClient({
  cookies: "_note_session_v5=...", // logged-in session (required for write operations)
  proxyUrl: "http://user:pass@proxy:8080", // optional; invalid URLs are ignored with a warning
  timeout: 14000, // ms
  retries: 2, // GET retries on network errors / timeouts / 429 / 502 / 503 / 504 (0 disables)
  userAgent: "...", // optional
});

// The positional form still works:
new NoteAPIClient("_note_session_v5=...", "http://proxy:8080");
```

## API

All methods take a single object argument and return a typed promise.

### Search (`GET /v3/searches`)

`size` is capped at **20** by note.com. To get the next page, pass the returned
`<context>_cursor` as `start`.

| Method | Params | Returns |
| --- | --- | --- |
| `searchNotesByKeyword` | `keyword`, `size?`, `start?`, `sort?: "popular" \| "new" \| "like" \| "hot"` | `NoteSearchResponse` |
| `searchUsersByKeyword` | `keyword`, `size?`, `start?` | `UserSearchResponse` |
| `searchMagazinesByKeyword` | `keyword`, `size?`, `start?` | `MagazineSearchResponse` |
| `searchHashtagsByKeyword` | `keyword`, `size?`, `start?` | `HashtagKeywordSearchResponse` |

```ts
const page1 = await client.searchNotesByKeyword({ keyword: "AI", size: 20 });
const page2 = await client.searchNotesByKeyword({
  keyword: "AI",
  size: 20,
  start: Number(page1.note_cursor),
});
```

### Notes

| Method | Params | Returns |
| --- | --- | --- |
| `getNoteDetail` | `key` (e.g. `"n1a0b26f944f4"`) | `NoteDetail` |
| `getNoteComments` | `key`, `page?`, `perPage?` (default 10), `order?: "newest" \| "oldest"`, `parentKey?` (replies) | `NoteCommentsResponse` |
| `getComments` | `id` (numeric `NoteDetail.id`), `maxId?` | `CommentsResponse` (legacy system) |
| `getNoteLikes` | `key`, `page?` (50 per page) | `NoteLikesResponse` |
| `searchNotesByUsername` | `username` (urlname), `page?` | `UserNotesResponse` |
| `searchNotesByCategory` | `category` (slug, e.g. `"tech"`), `order?: "popular" \| "new" \| "hot"`, `page?` | `CategorySearchResponse` |
| `searchNotesByHashtag` | `hashtag` (with or without `#`), `order?: "popular" \| "new" \| "hot"`, `paid_only?`, `page?` | `HashtagSearchResponse` |

```ts
const tech = await client.searchNotesByCategory({ category: "tech", order: "new" });
if (!tech.last_page) {
  await client.searchNotesByCategory({ category: "tech", order: "new", page: tech.next_page ?? 2 });
}

const paid = await client.searchNotesByHashtag({ hashtag: "#AI", order: "new", paid_only: true });
```

Category slugs are the `engName` values returned by `getCategories()`.

#### Comments

note.com runs two comment systems. Notes with `capabilities.note_comment === true` (most notes
published since late 2025) only return comments from `getNoteComments`; older notes only from
`getComments`.

```ts
import { noteCommentToText } from "note-api-client";

const note = await client.getNoteDetail({ key: "n7070cd22a1e3" });

if (note.capabilities.note_comment) {
  let page: number | null = 1;
  while (page) {
    const res = await client.getNoteComments({ key: note.key, page, perPage: 50 });
    for (const c of res.comments) {
      console.log(c.user.nickname, noteCommentToText(c.comment));
      if (c.reply_count > 0) {
        const replies = await client.getNoteComments({ key: note.key, parentKey: c.key, order: "oldest" });
        console.log(replies.comments.length, "replies");
      }
    }
    page = res.next_page;
  }
} else {
  // Legacy: 50 comments per call, newest first. Page with maxId.
  let maxId: number | undefined;
  for (;;) {
    const res = await client.getComments({ id: note.id, maxId });
    res.comments.forEach((c) => console.log(c.user.nickname, c.comment));
    if (res.rest_comment_count === 0 || res.comments.length === 0) break;
    maxId = Math.min(...res.comments.map((c) => c.id));
  }
}
```

### Users

| Method | Params | Returns |
| --- | --- | --- |
| `searchUserByUsername` | `username` | `User` |
| `getFollowers` | `key` (32-char user key), `page?`, `per?` (1–20) | `FollowsResponse` |
| `getFollowings` | `key`, `page?`, `per?` (1–20) | `FollowsResponse` |
| `getCurrentUser` | – (requires cookies) | `CurrentUser` |

```ts
const user = await client.searchUserByUsername({ username: "info" });
const followers = await client.getFollowers({ key: user.key, page: 1 });
console.log(followers.total_count, followers.is_last_page);
```

`per` above 20 throws a `RangeError`, because note.com silently returns an empty list for it.

### Magazines

| Method | Params | Returns |
| --- | --- | --- |
| `getMagazineDetail` | `key` (e.g. `"m891c62a08b36"`) | `MagazineDetail` |
| `getMagazineNotes` | `key`, `page?` (100 per page) | `MagazineNotesResponse` |
| `searchMagazinesByUsername` | `username`, `page?` | `CreatorMagazinesResponse` |

### Hashtags, categories and others

| Method | Params | Returns |
| --- | --- | --- |
| `getHashtagDetail` | `hashtag` | `HashtagDetail` (count, related hashtags) |
| `getCategories` | – | `CategoriesResponse` |
| `getContests` | `order?`, `group?` | `ContestsResponse` |
| `getMkitLayouts` | `context?` (`"category_challenge"`), `page?` | `MkitLayoutsResponse` |
| `getRecommendMetadata` | – | `PageMetadata` |

`getHashtags()` is deprecated: note.com removed the hashtag list endpoint, so it always rejects.
Use `searchHashtagsByKeyword` or `getHashtagDetail(...).relatedHashtags` instead.

## Writing notes

### Authentication

note.com now requires a reCAPTCHA token for `POST /v1/sessions/sign_in`, so `signIn()` only works
with a real `g_recaptcha_response` and otherwise rejects with code `required_recaptcha`.

For automation, log in with a browser and pass the session cookie:

1. Log in at https://note.com
2. Open DevTools → Application → Cookies → `https://note.com`
3. Copy the value of `_note_session_v5`

```ts
const client = new NoteAPIClient({ cookies: `_note_session_v5=${process.env.NOTE_SESSION}` });
const me = await client.getCurrentUser(); // throws NoteAPIError (401/404) if the cookie is invalid
```

Treat the cookie like a password. Cookies set by later responses are merged automatically.

### Create, save, publish, delete

| Method | Params | Notes |
| --- | --- | --- |
| `createNote` | `title`, `body?` | Creates a draft. note.com ignores the body on creation, so a non-empty body is saved with an extra `saveDraft` call. Returns `CreatedNote` (`id`, `key`, ...) |
| `saveDraft` | `id`, `title`, `body`, `isTempSaved?` (default `true`), `index?` | Saves the draft body |
| `uploadEyecatch` | `id`, `image?` (Buffer / Uint8Array / ArrayBuffer / Blob) or `imageUrl?` | PNG, JPEG, GIF, WebP. Attached to the note immediately |
| `editNote` | `id`, `title`, `body`, `eyecatchImageKey?`, `index?` | Publishes (or updates) the note |
| `draftDelete` | `id` | Discards the draft. A never-published note becomes `deleted`. Rejects with 404 when there is no draft |
| `deleteNote` | `id` | Deletes the note |

```ts
import fs from "node:fs";

const created = await client.createNote({ title: "My article", body: "<p>Hello</p>" });
await client.uploadEyecatch({ id: created.id, image: fs.readFileSync("cover.png") });
await client.editNote({ id: created.id, title: "My article", body: "<p>Hello</p>" });
```

### Table of contents (目次)

Add a `<table-of-contents>` element and pass `index: true` to both `saveDraft` and `editNote`.
Every block element should have a unique `name` and `id` (UUID). Only `<h2>` headings appear in the
table of contents. `<table>` is not supported by note.com and is stripped.

```ts
import { randomUUID as uuid } from "node:crypto";

const body = [
  `<table-of-contents name="${uuid()}" id="${uuid()}"><br></table-of-contents>`,
  `<h2 name="${uuid()}" id="${uuid()}">Introduction</h2>`,
  `<p name="${uuid()}" id="${uuid()}">First paragraph.</p>`,
  `<h2 name="${uuid()}" id="${uuid()}">Conclusion</h2>`,
  `<p name="${uuid()}" id="${uuid()}">Summary.</p>`,
].join("");

const created = await client.createNote({ title: "My article" });
await client.saveDraft({ id: created.id, title: "My article", body, isTempSaved: false, index: true });
await client.editNote({ id: created.id, title: "My article", body, index: true });
```

Supported tags: `<h2>`, `<h3>`, `<p>`, `<ul>`/`<ol>`/`<li>`, `<blockquote>`, `<pre><code>`,
`<figure>`/`<img>`, `<hr>`, `<strong>`, `<em>`, `<a>`, `<br>`.

## Error handling

```ts
import { NoteAPIError } from "note-api-client";

try {
  await client.getNoteDetail({ key: "nnotexist000" });
} catch (e) {
  if (e instanceof NoteAPIError) {
    console.log(e.status); // 400
    console.log(e.code); // "bad_request"
    console.log(e.message); // includes method, URL, status and note.com's message
    console.log(e.body); // raw response body
  }
}
```

Invalid arguments (missing ids, `page < 1`, `per > 20`, ...) throw `TypeError` / `RangeError`
before any request is sent. Some endpoints report errors with HTTP 200 and an `error` body; those
are thrown as `NoteAPIError` too.

## Low-level access

`client.get / post / put / delete / request` send arbitrary requests with the same headers,
cookies, retries and error handling and return the response's `data` field (`requestBody` returns
the whole body, for endpoints that put paging info next to `data`). They return `unknown` unless
you pass a type:

```ts
const top = await client.get<{ articles: { key: string; name: string }[]; next_page: number | null }>(
  `${client.BASE_URL}/v3/notes/top_articles`,
);
```

## Migrating from 0.0.x

- `getFollowers` / `getFollowings` were swapped; they now return followers / followings respectively.
- `searchNotesByCategory` sends `sort` (note.com ignored `order`), so `order` now takes effect.
  The response uses `last_page` (`is_last_page` is kept as an alias). `paid_only` had no effect and is deprecated.
- `searchUsersByKeyword` is typed as `users.contents` (the old type said `content`).
- `uploadEyecatch` actually uploads now (it used to send JSON and fail with `no_file_selected`) and accepts raw `image` bytes.
- `createNote` saves the body (note.com used to drop it silently).
- `editNote` only sends `eyecatch_image_key` when `eyecatchImageKey` is given (it used to send `null`).
- `getContests()` without `order` returns the newest contests first; pass `order: "priority"` for the old order.
- `getHashtags` always rejects (endpoint removed by note.com).
- `getComments` returns no comments for notes with `capabilities.note_comment === true`; use
  `getNoteComments` (added in 0.1.2). Legacy notes with more than 50 comments can be paged with `maxId`.
- The library no longer calls `dotenv.config()`; load your `.env` yourself.
- Errors are `NoteAPIError` instances instead of plain `Error`.

## Development

```sh
npm test            # unit tests (no network)
npm run test:live   # live tests against note.com (read-only)
npm run typecheck   # strict type check incl. compile-time API assertions
npm run build
```

`test:live` also checks every response against the exported TypeScript types and reports
fields note.com added. Optional live suites:

- `NOTE_LIVE_SWEEP=1` – wide sweep (~150 requests) over many keywords, categories, notes and
  creators to catch nullable fields that fixed fixtures miss. Runs weekly in CI.
- `NOTE_COOKIE="_note_session_v5=..."` – logged-in tests (create a draft and delete it again).
- `NOTE_LIVE_PUBLISH=1` (with `NOTE_COOKIE`) – also publishes a test note and deletes it.

## License

Apache License 2.0 – see [LICENSE](LICENSE).
