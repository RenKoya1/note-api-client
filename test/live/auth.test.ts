/**
 * Live tests for logged-in operations. Skipped unless NOTE_COOKIE is set
 * (the Cookie header of a logged-in browser session, at least
 * `_note_session_v5=...`). Everything created here is deleted again.
 *
 * Publishing is only exercised with NOTE_LIVE_PUBLISH=1, because a published
 * note is briefly visible to followers before it is deleted.
 */
import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import { assertContract, liveClient, pause } from "../helpers/live";
import { solidPng } from "../helpers/png";

const cookies = process.env.NOTE_COOKIE;
const skip = cookies ? false : "NOTE_COOKIE is not set";
const publish = process.env.NOTE_LIVE_PUBLISH === "1";

describe("authenticated", { skip }, () => {
  const client = liveClient(cookies);
  const created: number[] = [];

  after(async () => {
    for (const id of created) {
      await client.deleteNote({ id }).catch((e) => console.error(`cleanup of note ${id} failed:`, e));
    }
  });

  test("getCurrentUser", async (t) => {
    const me = await client.getCurrentUser();
    assertContract(t, me, "CurrentUser");
    assert.ok(me.urlname);
  });

  test("draft lifecycle: create -> save -> eyecatch -> discard", async () => {
    const title = `note-api-client live test ${new Date().toISOString()}`;
    const body = '<p name="p1" id="p1">created by note-api-client tests</p>';
    const note = await client.createNote({ title, body });
    created.push(note.id);
    assert.equal(note.name, title);
    assert.match(note.key, /^n[0-9a-f]+$/);

    await pause();
    let detail = await client.getNoteDetail({ key: note.key });
    assert.equal(detail.status, "draft");
    assert.equal(detail.body, body, "body passed to createNote must be saved");

    await pause();
    const body2 = '<p name="p2" id="p2">updated</p>';
    const saved = await client.saveDraft({ id: note.id, title: `${title} v2`, body: body2, isTempSaved: false });
    assert.equal(saved.result, true);

    await pause();
    detail = await client.getNoteDetail({ key: note.key });
    assert.equal(detail.name, `${title} v2`);
    assert.equal(detail.body, body2);

    await pause();
    const eyecatch = await client.uploadEyecatch({ id: note.id, image: solidPng(1280, 670) });
    assert.match(eyecatch.url, /^https:\/\/assets\.st-note\.com\//);

    await pause();
    detail = await client.getNoteDetail({ key: note.key });
    assert.ok(detail.eyecatch, "eyecatch must be attached to the note");

    await pause();
    await client.draftDelete({ id: note.id });
    detail = await client.getNoteDetail({ key: note.key });
    assert.equal(detail.status, "deleted");
  });

  test("publish and delete", { skip: publish ? false : "NOTE_LIVE_PUBLISH is not 1" }, async () => {
    const title = `note-api-client publish test ${new Date().toISOString()}`;
    const body = '<p name="p1" id="p1">published by note-api-client tests and deleted right away</p>';
    const note = await client.createNote({ title, body });
    created.push(note.id);

    await pause();
    await client.uploadEyecatch({ id: note.id, image: solidPng(1280, 670) });
    await pause();
    await client.editNote({ id: note.id, title, body });

    await pause();
    const detail = await client.getNoteDetail({ key: note.key });
    assert.equal(detail.status, "published");
    assert.equal(detail.body, body);
    assert.ok(detail.eyecatch, "publishing must keep the uploaded eyecatch");

    await pause();
    const res = await client.deleteNote({ id: note.id });
    assert.equal(res.result, true);
    created.splice(created.indexOf(note.id), 1);
  });
});
