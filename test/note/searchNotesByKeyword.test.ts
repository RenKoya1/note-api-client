import { client } from "..";
import { Cursor, Notes } from "../../src";

client
  .searchNotesByKeyword({
    keyword: "AI",
  })
  .then((data: { notes: Notes; cursor: Cursor }) => {
    console.log("Keyword Search Response:");
    console.log("Total Count:", data.notes.total_count);
    console.log("Is Last Page:", data.notes.is_last_page);
    console.log("Notes Count:", data.notes.contents.length);
    console.log("\nCursor:", data.cursor);
    console.log("\nNotes:");
    data.notes.contents.slice(0, 3).forEach((note, index) => {
      console.log(`\nNote ${index + 1}:`);
      console.log("  Title:", note.name);
      console.log("  Author:", note.user?.nickname);
      console.log("  Like Count:", note.like_count);
      console.log("  Price:", note.price);
      console.log("  Price Info:", JSON.stringify(note.price_info));
    });
  });
