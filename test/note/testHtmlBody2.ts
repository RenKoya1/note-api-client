import { NoteAPIClient } from "../../src";
import dotenv from "dotenv";
dotenv.config();

async function inspectBody2() {
  const client = new NoteAPIClient();

  await client.signIn({
    login: process.env.NOTE_EMAIL || "",
    password: process.env.NOTE_PASSWORD || "",
    g_recaptcha_response: "",
    redirect_path: "/",
  });

  // note.comのエディタはMkitを使っている可能性がある
  // テーブルを別の形式で試す
  // また、目次は note.com の <note-embed> や特殊タグかもしれない

  const testBody = [
    "<h2>目次が自動生成されるか確認</h2>",
    "<p>note.comは見出しから自動的に目次を生成する機能があるか確認。</p>",
    "<h2>セクション1: はじめに</h2>",
    "<p>最初のセクションの内容です。</p>",
    "<h2>セクション2: 本題</h2>",
    "<p>二番目のセクションの内容です。</p>",
    "<h3>サブセクション2-1</h3>",
    "<p>サブセクションの説明。</p>",
    "<h2>セクション3: まとめ</h2>",
    "<p>まとめの内容です。</p>",
  ].join("");

  const created = await client.createNote({
    title: "目次テスト - 見出し構造確認",
    body: testBody,
  });

  const articleKey = created.id.toString();

  const published = await client.editNote({
    id: articleKey,
    title: "目次テスト - 見出し構造確認",
    body: testBody,
  });
  console.log("Published URL:", (published as any).note_url);

  // Fetch to inspect full structure
  const detail = await client.getNoteDetail({ key: created.key });
  console.log("\n=== Full detail keys ===");
  console.log(Object.keys(detail as any));
  console.log("\nbody:", (detail as any).body);
  console.log("\nfree_body:", (detail as any).free_body);
  console.log("\nseparator_map:", (detail as any).separator_map);
  console.log("\nnote_index:", (detail as any).note_index);
  console.log("\ntoc:", (detail as any).toc);

  // Cleanup
  await client.deleteNote({ id: articleKey });
  console.log("\nDeleted.");
}
inspectBody2().catch((e) => console.error("FATAL:", e));
