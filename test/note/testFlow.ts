import { NoteAPIClient } from "../../src";
import dotenv from "dotenv";
dotenv.config();

async function testFlow() {
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
  console.log("CSRF Token:", client.csrfToken || "NOT SET");

  // Step 2: createNote
  console.log("\n=== Step 2: createNote ===");
  const createdArticle = await client.createNote({
    title: "テスト投稿 - フロー確認",
    body: "<p>テスト本文です。</p>",
  });

  if (!createdArticle) {
    throw new Error("notePostPubsub_failedToCreateArticle");
  }
  console.log("Created article:", JSON.stringify(createdArticle, null, 2));

  const articleKey = createdArticle.id.toString();
  console.log("articleKey:", articleKey);

  // Step 3: editNote (publish)
  console.log("\n=== Step 3: editNote ===");
  try {
    const editResult = await client.editNote({
      id: articleKey,
      title: "テスト投稿 - フロー確認",
      body: "<p>テスト本文です。</p>",
    });
    console.log("Edit result:", JSON.stringify(editResult, null, 2));
  } catch (e: any) {
    console.error("editNote FAILED:", e.message);
  }

  // Cleanup
  console.log("\n=== Cleanup ===");
  try {
    await client.deleteNote({ id: articleKey });
    console.log("Deleted note:", articleKey);
  } catch (e: any) {
    console.log("Delete failed:", e.message);
  }
}
testFlow().catch((e) => console.error("FATAL:", e.message));
