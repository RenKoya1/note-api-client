import { client } from "..";
import { HashtagSearchResponse, HashtagSearchNote } from "../../src";

client
  .searchNotesByHashtag({
    hashtag: "AI",
    order: "new",
    paid_only: true,
  })
  .then((data: HashtagSearchResponse) => {
    console.log("Hashtag Search Response:");
    console.log("Is Last Page:", data.is_last_page);
    console.log("Count:", data.count);
    console.log("Notes Count:", data.notes.length);
    console.log("\nNotes:");
    data.notes.slice(0, 3).forEach((note: HashtagSearchNote, index: number) => {
      console.log(`\nNote ${index + 1}:`);
      console.log("  Title:", note.name);
      console.log("  Author:", note.user.nickname);
      console.log("  Like Count:", note.like_count);
      console.log("  Price:", note.price);
    });
  });
