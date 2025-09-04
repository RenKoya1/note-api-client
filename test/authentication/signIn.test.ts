import { client } from "..";

client
  .signIn({
    login: process.env.NOTE_EMAIL || "",
    password: process.env.NOTE_PASSWORD || "",
    g_recaptcha_response: "",
    redirect_path: "/",
  })
  .then((data: any) => {
    console.log("Signed in successfully:", data);
  })
  .catch((error: any) => {
    console.error("Error signing in:", error);
  });
