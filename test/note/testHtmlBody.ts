import { NoteAPIClient } from "../../src";
import dotenv from "dotenv";
dotenv.config();

async function inspectBody() {
  const client = new NoteAPIClient();

  // Sign in to get full access
  await client.signIn({
    login: process.env.NOTE_EMAIL || "",
    password: process.env.NOTE_PASSWORD || "",
    g_recaptcha_response: "",
    redirect_path: "/",
  });

  // Test 1: Create a note with various HTML elements and see what sticks
  console.log("=== Creating test note with table & headings ===");
  const testBody = [
    "<h2>目次テスト</h2>",
    "<h3>セクション1</h3>",
    "<p>段落テキスト1</p>",
    "<h3>セクション2</h3>",
    "<p>段落テキスト2</p>",
    "<h2>テーブルテスト</h2>",
    "<table><thead><tr><th>項目</th><th>値</th></tr></thead><tbody><tr><td>A</td><td>100</td></tr><tr><td>B</td><td>200</td></tr></tbody></table>",
    "<h2>その他の要素</h2>",
    "<ul><li>リスト1</li><li>リスト2</li></ul>",
    "<ol><li>番号1</li><li>番号2</li></ol>",
    "<blockquote>引用テキスト</blockquote>",
    "<pre><code>コードブロック</code></pre>",
  ].join("");

  const created = await client.createNote({
    title: "HTML要素テスト - テーブル&目次",
    body: testBody,
  });
  console.log("Created id:", created.id);

  const articleKey = created.id.toString();

  // Publish
  const published = await client.editNote({
    id: articleKey,
    title: "HTML要素テスト - テーブル&目次",
    body: testBody,
  });
  console.log("Published URL:", (published as any).note_url);

  // Now fetch the article to see what the server stored
  console.log("\n=== Fetching note detail ===");
  const detail = await client.getNoteDetail({ key: created.key });
  console.log(
    "body (first 2000 chars):",
    JSON.stringify((detail as any).body).substring(0, 2000),
  );
  console.log(
    "\nfree_body (first 2000 chars):",
    JSON.stringify((detail as any).free_body).substring(0, 2000),
  );

  // Cleanup
  console.log("\n=== Cleanup ===");
  await client.deleteNote({ id: articleKey });
  console.log("Deleted.");
}
inspectBody().catch((e) => console.error("FATAL:", e.message));
