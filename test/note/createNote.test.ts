import { client } from "..";

async function testCreateNote() {
  try {
    // Step 1: Sign in
    console.log("=== Step 1: Signing in... ===");
    await client.signIn({
      login: process.env.NOTE_EMAIL || "",
      password: process.env.NOTE_PASSWORD || "",
      g_recaptcha_response: "",
      redirect_path: "/",
    });
    console.log(
      "Sign in successful. Cookies:",
      client.cookies ? "SET" : "NOT SET",
    );
    console.log("CSRF Token:", client.csrfToken ? "SET" : "NOT SET");

    // Step 2: Create a note (draft)
    console.log("\n=== Step 2: Creating note... ===");
    const createResult = await client.createNote({
      title: "テスト投稿 - API動作確認",
      body: "<p>これはAPIクライアントからのテスト投稿です。</p>",
    });
    console.log("Create note result:", JSON.stringify(createResult, null, 2));

    // Step 3: Clean up - delete the draft
    if (createResult && (createResult as any).id) {
      console.log("\n=== Step 3: Cleaning up (deleting draft)... ===");
      const noteId = String((createResult as any).id);
      try {
        await client.draftDelete({ id: noteId });
        console.log("Draft deleted successfully.");
      } catch (deleteError) {
        console.log(
          "Draft delete failed (may need different cleanup):",
          deleteError,
        );
      }
    }

    console.log("\n=== TEST PASSED: Note creation works! ===");
  } catch (error: any) {
    console.error("\n=== TEST FAILED ===");
    console.error("Error:", error.message || error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
  }
}

testCreateNote();
