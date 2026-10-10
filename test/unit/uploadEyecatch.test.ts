import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { NoteAPIClient } from "../../src";

// 2x1 PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR42mNk+M9Qz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC",
  "base64",
);

interface Received {
  method: string;
  url: string;
  contentType: string;
  body: Buffer;
}

// Real HTTP round trip so the multipart encoding done by axios is verified.
describe("uploadEyecatch (local HTTP server)", () => {
  let server: http.Server;
  let base: string;
  const received: Received[] = [];

  before(async () => {
    server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        if (req.url === "/image.png") {
          res.writeHead(200, { "Content-Type": "image/png" }).end(PNG);
          return;
        }
        if (req.url === "/missing.png") {
          res.writeHead(404).end();
          return;
        }
        received.push({
          method: req.method!,
          url: req.url!,
          contentType: String(req.headers["content-type"]),
          body: Buffer.concat(chunks),
        });
        res
          .writeHead(201, { "Content-Type": "application/json" })
          .end(JSON.stringify({ data: { url: "https://assets.st-note.com/x.png" } }));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  after(() => new Promise<void>((resolve) => server.close(() => resolve())));

  function client() {
    const c = new NoteAPIClient({ cookies: "_note_session_v5=s" });
    c.BASE_URL = `${base}/api`;
    return c;
  }

  test("sends multipart/form-data with file, note_id and dimensions", async () => {
    const res = await client().uploadEyecatch({ id: 42, image: PNG });
    assert.deepEqual(res, { url: "https://assets.st-note.com/x.png" });
    const req = received.at(-1)!;
    assert.equal(req.method, "POST");
    assert.equal(req.url, "/api/v1/image_upload/note_eyecatch");
    assert.match(req.contentType, /^multipart\/form-data; boundary=/);
    const text = req.body.toString("latin1");
    assert.match(text, /name="note_id"\r\n\r\n42\r\n/);
    assert.match(text, /name="width"\r\n\r\n2\r\n/);
    assert.match(text, /name="height"\r\n\r\n1\r\n/);
    assert.match(text, /name="file"; filename="blob"\r\nContent-Type: image\/png/);
    assert.ok(req.body.includes(PNG), "raw PNG bytes must be in the body");
  });

  test("downloads imageUrl first", async () => {
    await client().uploadEyecatch({ id: "7", imageUrl: `${base}/image.png` });
    const req = received.at(-1)!;
    assert.match(req.body.toString("latin1"), /name="note_id"\r\n\r\n7\r\n/);
    assert.ok(req.body.includes(PNG));
  });

  test("accepts Blob / ArrayBuffer input", async () => {
    await client().uploadEyecatch({ id: 1, image: new Blob([PNG]) });
    await client().uploadEyecatch({
      id: 1,
      image: PNG.buffer.slice(PNG.byteOffset, PNG.byteOffset + PNG.byteLength),
    });
    assert.ok(received.at(-1)!.body.includes(PNG));
    assert.ok(received.at(-2)!.body.includes(PNG));
  });

  test("rejects failed downloads, missing input and non-images", async () => {
    const before = received.length;
    await assert.rejects(
      client().uploadEyecatch({ id: 1, imageUrl: `${base}/missing.png` }),
      /failed to download eyecatch image \(404/,
    );
    await assert.rejects(client().uploadEyecatch({ id: 1 }), TypeError);
    await assert.rejects(client().uploadEyecatch({ id: 1, image: Buffer.from("not an image") }));
    assert.equal(received.length, before, "nothing must be uploaded");
  });
});
