import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { NoteAPIClient, NoteAPIError } from "../../src";
import { mergeCookies } from "../../src/client/cookies";
import { mockClient } from "../helpers/mock";

describe("constructor", () => {
  test("accepts positional cookies (backward compatible)", () => {
    const client = new NoteAPIClient("_note_session_v5=abc");
    assert.equal(client.cookies, "_note_session_v5=abc");
    assert.equal(client.isAuthenticated, true);
  });

  test("accepts an options object", () => {
    const client = new NoteAPIClient({ cookies: "a=1", timeout: 5000 });
    assert.equal(client.cookies, "a=1");
    assert.equal(client.isAuthenticated, false);
    assert.equal((client as any).client.defaults.timeout, 5000);
  });

  test("no cookies -> not authenticated", () => {
    const client = new NoteAPIClient();
    assert.equal(client.cookies, null);
    assert.equal(client.isAuthenticated, false);
  });

  test("valid proxy url installs an https proxy agent", () => {
    const client = new NoteAPIClient(undefined, "http://user:pass@127.0.0.1:8080");
    const defaults = (client as any).client.defaults;
    assert.ok(defaults.httpsAgent);
    assert.equal(defaults.proxy, false);
  });

  test("invalid proxy urls are ignored with a warning", (t) => {
    const warn = t.mock.method(console, "warn", () => {});
    for (const bad of ["encrypted:abcdef", "socks5://127.0.0.1:1080", "not a url"]) {
      const client = new NoteAPIClient({ proxyUrl: bad });
      assert.equal((client as any).client.defaults.httpsAgent, undefined, bad);
    }
    assert.equal(warn.mock.callCount(), 3);
  });
});

describe("request headers", () => {
  test("GET sends browser-like headers without Content-Type or Cookie when anonymous", async () => {
    const { client, requests } = mockClient();
    await client.get("https://note.com/api/v2/categories");
    const h = requests[0].headers;
    assert.match(h["User-Agent"], /Mozilla\/5\.0/);
    assert.equal(h["X-Requested-With"], "XMLHttpRequest");
    assert.equal(h.Origin, "https://note.com");
    assert.equal(h.Cookie, undefined);
    assert.equal(h["Content-Type"], undefined);
  });

  test("cookies and csrf token are sent when present", async () => {
    const { client, requests } = mockClient(() => ({ body: { data: {} } }), {
      cookies: "_note_session_v5=s1",
    });
    client.csrfToken = "tok";
    await client.post("https://note.com/api/x", { a: 1 });
    const h = requests[0].headers;
    assert.equal(h.Cookie, "_note_session_v5=s1");
    assert.equal(h["X-CSRF-Token"], "tok");
    assert.equal(h["Content-Type"], "application/json");
    assert.deepEqual(requests[0].json, { a: 1 });
  });

  test("FormData bodies are not forced to JSON", async () => {
    const { client, requests } = mockClient();
    const form = new FormData();
    form.append("note_id", "1");
    form.append("file", new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }), "blob");
    await client.post("https://note.com/api/v1/image_upload/note_eyecatch", form);
    assert.ok(requests[0].data instanceof FormData, "body must stay FormData");
    assert.notEqual(requests[0].headers["Content-Type"], "application/json");
  });

  test("custom user agent", async () => {
    const { client, requests } = mockClient(undefined, { userAgent: "my-bot/1.0" });
    await client.get("https://note.com/api/x");
    assert.equal(requests[0].headers["User-Agent"], "my-bot/1.0");
  });

  test("undefined and null params are dropped", async () => {
    const { client, requests } = mockClient();
    await client.get("https://note.com/api/x", { a: 1, b: undefined, c: null, d: false });
    assert.deepEqual(requests[0].params, { a: 1, d: false });
  });
});

describe("responses", () => {
  test("returns the data field", async () => {
    const { client } = mockClient(() => ({ body: { data: { hello: "world" } } }));
    assert.deepEqual(await client.get("https://note.com/api/x"), { hello: "world" });
  });

  test("2xx with error object throws NoteAPIError", async () => {
    const { client } = mockClient(() => ({
      body: { error: { code: "not_found", message: "not_found" } },
    }));
    await assert.rejects(client.get("https://note.com/api/v1/note/1/comments"), (e: any) => {
      assert.ok(e instanceof NoteAPIError);
      assert.equal(e.status, 200);
      assert.equal(e.code, "not_found");
      assert.equal(e.method, "GET");
      return true;
    });
  });

  test("4xx with {error:{message,type}} uses type as code", async () => {
    const { client } = mockClient(() => ({
      status: 400,
      body: { error: { message: "Invalid order type", type: "bad_request" } },
    }));
    await assert.rejects(client.get("https://note.com/api/v3/hashtags/AI/notes"), (e: any) => {
      assert.ok(e instanceof NoteAPIError);
      assert.equal(e.status, 400);
      assert.equal(e.code, "bad_request");
      assert.match(e.message, /Invalid order type/);
      assert.match(e.message, /-> 400/);
      return true;
    });
  });

  test("4xx with {error: string}", async () => {
    const { client } = mockClient(() => ({ status: 404, body: { error: "マガジンが見つかりません" } }));
    await assert.rejects(client.get("https://note.com/api/v1/magazines/m0"), (e: any) => {
      assert.equal(e.status, 404);
      assert.match(e.message, /マガジンが見つかりません/);
      return true;
    });
  });

  test("4xx with {data: string}", async () => {
    const { client } = mockClient(() => ({ status: 404, body: { data: "リソースが見つかりません" } }));
    await assert.rejects(client.get("https://note.com/api/v2/creators/x"), (e: any) => {
      assert.equal(e.status, 404);
      assert.match(e.message, /リソースが見つかりません/);
      return true;
    });
  });

  test("4xx with an HTML page", async () => {
    const { client } = mockClient(() => ({ status: 404, body: "<!DOCTYPE html><html></html>" }));
    await assert.rejects(client.get("https://note.com/api/v2/hashtags"), (e: any) => {
      assert.ok(e instanceof NoteAPIError);
      assert.equal(e.status, 404);
      assert.match(e.message, /status code 404/);
      return true;
    });
  });

  test("requestBody returns the whole body", async () => {
    const { client } = mockClient(() => ({ body: { data: [1], next_page: 2 } }));
    assert.deepEqual(await client.requestBody("GET", "https://note.com/api/x"), { data: [1], next_page: 2 });
  });

  test("2xx without a data field throws", async () => {
    const { client } = mockClient(() => ({ body: "<html>ok</html>" }));
    await assert.rejects(client.get("https://note.com/api/x"), /unexpected response/);
  });

  test("network errors become NoteAPIError without status", async () => {
    const client = new NoteAPIClient();
    (client as any).client.defaults.adapter = async () => {
      const err: any = new Error("connect ECONNREFUSED");
      err.isAxiosError = true;
      err.code = "ECONNREFUSED";
      err.toJSON = () => ({});
      throw err;
    };
    await assert.rejects(client.get("https://note.com/api/x"), (e: any) => {
      assert.ok(e instanceof NoteAPIError);
      assert.equal(e.status, undefined);
      assert.equal(e.code, "ECONNREFUSED");
      return true;
    });
  });

  test("csrf_token in a response is stored", async () => {
    const { client } = mockClient(() => ({ body: { data: { csrf_token: "abc" } } }));
    await client.post("https://note.com/api/v1/sessions/sign_in", {});
    assert.equal(client.csrfToken, "abc");
  });
});

describe("retries", () => {
  // Retry-After: 0 keeps the tests fast.
  const transient = (status: number) => ({ status, body: { error: "busy" }, headers: { "retry-after": "0" } });

  test("GET is retried on 429/502/503/504", async () => {
    for (const status of [429, 502, 503, 504]) {
      let calls = 0;
      const { client } = mockClient(() => (calls++ < 2 ? transient(status) : { body: { data: "ok" } }));
      assert.equal(await client.get("https://note.com/api/x"), "ok", String(status));
      assert.equal(calls, 3);
    }
  });

  test("gives up after `retries` and reports the last error", async () => {
    let calls = 0;
    const { client } = mockClient(() => (calls++, transient(503)), { retries: 1 });
    await assert.rejects(client.get("https://note.com/api/x"), (e: any) => e.status === 503);
    assert.equal(calls, 2);
  });

  test("non-transient errors and non-GET requests are not retried", async () => {
    let calls = 0;
    const { client } = mockClient(() => (calls++, { status: 404, body: { error: "x" } }));
    await assert.rejects(client.get("https://note.com/api/x"));
    assert.equal(calls, 1);

    calls = 0;
    const post = mockClient(() => (calls++, transient(503)));
    await assert.rejects(post.client.post("https://note.com/api/x", {}));
    assert.equal(calls, 1, "POST must not be retried");
  });

  test("retries: 0 disables retrying", async () => {
    let calls = 0;
    const { client } = mockClient(() => (calls++, transient(504)), { retries: 0 });
    await assert.rejects(client.get("https://note.com/api/x"));
    assert.equal(calls, 1);
  });
});

describe("cookie jar", () => {
  test("Set-Cookie is merged instead of replacing the session", async () => {
    const { client } = mockClient(
      () => ({ body: { data: {} }, headers: { "set-cookie": ["fp=new; path=/; HttpOnly"] } }),
      { cookies: "_note_session_v5=keep; fp=old" },
    );
    await client.post("https://note.com/api/v1/text_notes/draft_save", {});
    assert.equal(client.cookies, "_note_session_v5=keep; fp=new");
  });

  test("cookies are also stored from GET and error responses", async () => {
    let call = 0;
    const { client } = mockClient(() =>
      call++ === 0
        ? { body: { data: {} }, headers: { "set-cookie": ["a=1"] } }
        : { status: 401, body: { error: "x" }, headers: { "set-cookie": ["b=2"] } },
    );
    await client.get("https://note.com/api/x");
    await assert.rejects(client.get("https://note.com/api/y"));
    assert.equal(client.cookies, "a=1; b=2");
  });

  test("mergeCookies handles deletion and attributes", () => {
    assert.equal(mergeCookies(null, undefined), null);
    assert.equal(mergeCookies("a=1", []), "a=1");
    assert.equal(mergeCookies("a=1; b=2", ["b=; Max-Age=0; path=/"]), "a=1");
    assert.equal(
      mergeCookies("a=1", ["a=; expires=Thu, 01 Jan 1970 00:00:00 GMT"]),
      null,
    );
    assert.equal(mergeCookies("a=1", ["c=x=y; Path=/; Secure"]), "a=1; c=x=y");
    assert.equal(
      mergeCookies(null, ["s=1; expires=Fri, 01 Jan 2100 00:00:00 GMT"]),
      "s=1",
    );
  });
});
