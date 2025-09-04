import { client } from "..";

client
  .signIn({
    email: process.env.NOTE_EMAIL || "",
    password: process.env.NOTE_PASSWORD || "",
    g_recaptcha_response: "",
    redirect_path: "/",
  })
  .then((data: any) => {
    client
      .createNote({
        title: "Test Note",
        body: "This is a test note created via the NoteAPIClient.",
      })
      .then((data: any) => {
        console.log(data);
      });
  });
