import { NoteAPIClient } from "../../src";
import dotenv from "dotenv";
dotenv.config();

async function inspectExistingNote() {
  const client = new NoteAPIClient();

  await client.signIn({
    login: process.env.NOTE_EMAIL || "",
    password: process.env.NOTE_PASSWORD || "",
    g_recaptcha_response: "",
    redirect_path: "/",
  });

  // note.com で目次やテーブルを使っている記事を取得して body を確認
  // まず、テーブルを含む記事を検索
  console.log("=== テーブル含む記事を検索 ===");
  const results = await client.searchNotesByKeyword({
    keyword: "テーブル 表 一覧",
  });
  const notes = (results as any).notes?.contents || [];

  // 最初の記事の body を見る
  for (let i = 0; i < Math.min(3, notes.length); i++) {
    const note = notes[i];
    console.log(`\n--- Note ${i + 1}: ${note.name} (key: ${note.key}) ---`);
    try {
      const detail = await client.getNoteDetail({ key: note.key });
      const body = (detail as any).body || "";
      // table, figure, iframe, embed 等の特殊タグを探す
      const hasTable = body.includes("<table") || body.includes("table");
      const hasFigure = body.includes("<figure");
      const hasIframe = body.includes("<iframe");
      const hasEmbed = body.includes("embed");
      const hasIndex = body.includes("index") || body.includes("目次");
      console.log(
        "Has table:",
        hasTable,
        "| Has figure:",
        hasFigure,
        "| Has iframe:",
        hasIframe,
        "| Has embed:",
        hasEmbed,
        "| Has index:",
        hasIndex,
      );

      // body内のHTMLタグ一覧を抽出
      const tagMatches = body.match(/<[a-z][a-z0-9-]*[^>]*>/gi) || [];
      const uniqueTags = [
        ...new Set(
          tagMatches.map((t: string) => t.match(/<([a-z][a-z0-9-]*)/i)?.[1]),
        ),
      ];
      console.log("HTML Tags used:", uniqueTags);

      // tableやdata関連の部分を抜粋
      if (hasTable) {
        const idx = body.indexOf("table");
        console.log(
          "Table context:",
          body.substring(Math.max(0, idx - 200), idx + 500),
        );
      }
    } catch (e: any) {
      console.log("  Error:", e.message);
    }
  }
}
inspectExistingNote().catch((e) => console.error("FATAL:", e));
