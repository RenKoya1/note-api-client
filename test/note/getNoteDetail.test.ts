import { client } from "..";
import { NoteDetail } from "../../src";

client
  .getNoteDetail({
    key: "n1a0b26f944f4",
  })
  .then((data: NoteDetail) => {
    console.log("Note Detail:");
    console.log("ID:", data.id);
    console.log("Title:", data.name);
    console.log("Author:", data.user.nickname);
    console.log("Like Count:", data.like_count);
    console.log("Comment Count:", data.comment_count);
    console.log("Published At:", data.publish_at);
    console.log("URL:", data.note_url);
    console.log("Hashtags:", data.hashtag_notes.map((h) => h.hashtag.name).join(", "));
  });
