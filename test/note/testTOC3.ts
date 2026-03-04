import { NoteAPIClient } from "../../src";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

function uuid() {
  return crypto.randomUUID();
}

async function testTOC3() {
  const client = new NoteAPIClient();

  await client.signIn({
    login: process.env.NOTE_EMAIL || "",
    password: process.env.NOTE_PASSWORD || "",
    g_recaptcha_response: "",
    redirect_path: "/",
  });

  const tocId = uuid();
  const h2_1 = uuid();
  const p1 = uuid();
  const h2_2 = uuid();
  const p2 = uuid();
  const h2_3 = uuid();
  const p3 = uuid();

  const body = [
    `<table-of-contents name="${tocId}" id="${tocId}"><br></table-of-contents>`,
    `<h2 name="${h2_1}" id="${h2_1}">セクション1: はじめに</h2>`,
    `<p name="${p1}" id="${p1}">はじめにの内容です。</p>`,
    `<h2 name="${h2_2}" id="${h2_2}">セクション2: 本題</h2>`,
    `<p name="${p2}" id="${p2}">本題の内容です。</p>`,
    `<h2 name="${h2_3}" id="${h2_3}">セクション3: まとめ</h2>`,
    `<p name="${p3}" id="${p3}">まとめの内容です。</p>`,
  ].join("");

  // Step 1: createNote (空の下書き作成)
  console.log("=== Step 1: createNote ===");
  const created = await client.createNote({
    title: "目次テスト3 - index:true",
    body: "",
  });
  console.log("Created id:", created.id, "key:", created.key);

  // Step 2: saveDraft with index: true
  console.log("\n=== Step 2: saveDraft (index: true) ===");
  const draftUrl = `${client.BASE_URL}/v1/text_notes/draft_save?id=${created.id}&is_temp_saved=false`;
  const draftData = {
    name: "目次テスト3 - index:true",
    body: body,
    body_length: body.replace(/<[^>]*>/g, "").length,
    index: true,
    is_lead_form: false,
  };
  const draftResult = await client.post<any>(draftUrl, draftData);
  console.log(
    "Draft saved:",
    JSON.stringify(draftResult, null, 2).substring(0, 500),
  );

  // Step 3: editNote (publish) with index: true in the data
  console.log("\n=== Step 3: editNote (publish) ===");
  const editUrl = `${client.BASE_URL}/v1/text_notes/${created.id}`;
  const editData = {
    status: "published",
    name: "目次テスト3 - index:true",
    free_body: body,
    index: true,
  };
  const published = await client.put<any>(editUrl, editData);
  console.log("Published URL:", published?.note_url);

  // Verify
  console.log("\n=== Verify ===");
  const detail = await client.getNoteDetail({ key: created.key });
  console.log("index field:", (detail as any).index);
  const storedBody = (detail as any).body || "";
  console.log("Has TOC tag:", storedBody.includes("table-of-contents"));
  console.log("Body:", storedBody.substring(0, 300));

  console.log("\n※ 削除していません。ブラウザで確認してください。");
}
testTOC3().catch((e) => console.error("FATAL:", e.message || e));
