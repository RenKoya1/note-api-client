/** README examples, kept here so they are type-checked. Never executed. */
import fs from "node:fs";
import { randomUUID as uuid } from "node:crypto";
import { NoteAPIClient, NoteAPIError, noteCommentToText } from "../../src";

export async function readmeExamples() {
  const client = new NoteAPIClient();

  const res = await client.searchNotesByKeyword({ keyword: "TypeScript", sort: "new" });
  for (const note of res.notes.contents) {
    console.log(note.name, note.user.nickname, note.like_count);
  }
  const detail = await client.getNoteDetail({ key: "n1a0b26f944f4" });
  console.log(detail.body);

  new NoteAPIClient({ cookies: "_note_session_v5=...", proxyUrl: "http://user:pass@proxy:8080", timeout: 14000, retries: 2, userAgent: "..." });
  new NoteAPIClient("_note_session_v5=...", "http://proxy:8080");

  const page1 = await client.searchNotesByKeyword({ keyword: "AI", size: 20 });
  await client.searchNotesByKeyword({ keyword: "AI", size: 20, start: Number(page1.note_cursor) });

  const tech = await client.searchNotesByCategory({ category: "tech", order: "new" });
  if (!tech.last_page) {
    await client.searchNotesByCategory({ category: "tech", order: "new", page: tech.next_page ?? 2 });
  }
  await client.searchNotesByHashtag({ hashtag: "#AI", order: "new", paid_only: true });

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
    let maxId: number | undefined;
    for (;;) {
      const res = await client.getComments({ id: note.id, maxId });
      res.comments.forEach((c) => console.log(c.user.nickname, c.comment));
      if (res.rest_comment_count === 0 || res.comments.length === 0) break;
      maxId = Math.min(...res.comments.map((c) => c.id));
    }
  }

  const user = await client.searchUserByUsername({ username: "info" });
  const followers = await client.getFollowers({ key: user.key, page: 1 });
  console.log(followers.total_count, followers.is_last_page);

  const authed = new NoteAPIClient({ cookies: `_note_session_v5=${process.env.NOTE_SESSION}` });
  await authed.getCurrentUser();

  const created = await authed.createNote({ title: "My article", body: "<p>Hello</p>" });
  await authed.uploadEyecatch({ id: created.id, image: fs.readFileSync("cover.png") });
  await authed.editNote({ id: created.id, title: "My article", body: "<p>Hello</p>" });

  const body = [
    `<table-of-contents name="${uuid()}" id="${uuid()}"><br></table-of-contents>`,
    `<h2 name="${uuid()}" id="${uuid()}">Introduction</h2>`,
  ].join("");
  const toc = await authed.createNote({ title: "My article" });
  await authed.saveDraft({ id: toc.id, title: "My article", body, isTempSaved: false, index: true });
  await authed.editNote({ id: toc.id, title: "My article", body, index: true });

  try {
    await client.getNoteDetail({ key: "nnotexist000" });
  } catch (e) {
    if (e instanceof NoteAPIError) {
      console.log(e.status, e.code, e.message, e.body);
    }
  }

  const top = await client.get<{ articles: { key: string; name: string }[]; next_page: number | null }>(
    `${client.BASE_URL}/v3/notes/top_articles`,
  );
  console.log(top.articles[0]?.name);
}
