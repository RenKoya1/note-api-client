import { NoteAPIClient } from "../../src";
import dotenv from "dotenv";
dotenv.config();

async function testPublish() {
  const client = new NoteAPIClient();

  // Step 1: Sign in
  console.log("=== Step 1: Sign in ===");
  await client.signIn({
    login: process.env.NOTE_EMAIL || "",
    password: process.env.NOTE_PASSWORD || "",
    g_recaptcha_response: "",
    redirect_path: "/",
  });
  console.log("Cookies:", client.cookies ? "SET" : "NOT SET");

  // Step 2: createNote
  console.log("\n=== Step 2: createNote ===");
  const createdArticle = await client.createNote({
    title: "API動作確認テスト - 削除しないで残す",
    body: "<p>これはAPIクライアントからの投稿テストです。記事一覧に表示されるか確認します。</p>",
  });
  console.log("Created:", JSON.stringify(createdArticle, null, 2));

  const articleKey = createdArticle.id.toString();

  // Step 3: editNote (publish)
  console.log("\n=== Step 3: editNote (publish) ===");
  const editResult = await client.editNote({
    id: articleKey,
    title: "API動作確認テスト - 削除しないで残す",
    body: "<p>これはAPIクライアントからの投稿テストです。記事一覧に表示されるか確認します。</p>",
  });
  console.log("Published:", JSON.stringify(editResult, null, 2));
  console.log("\n=== 記事URL ===");
  console.log((editResult as any).note_url);
  console.log("\n※ 削除していません。note.comで記事を確認してください。");
}
testPublish().catch((e) => console.error("FATAL:", e.message));
