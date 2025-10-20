import { client } from "..";

client
  .signIn({
    login: process.env.NOTE_EMAIL || "",
    password: process.env.NOTE_PASSWORD || "",
    g_recaptcha_response: "",
    redirect_path: "/",
  })
  .then(async (data: any) => {
    try {
      console.log(client.cookies);
      // await client.createNote({
      //   title: "Test Note",
      //   body: "This is a test note created during sign-in test.",
      // });
      console.log("Note created successfully");
    } catch (error) {
      console.error("Error creating note:", error);
    }
  })
  .catch((error: any) => {
    console.error("Error signing in:", error);
  });
