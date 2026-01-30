import { client } from "..";
import { CategorySearchResponse } from "../../src";

client
  .searchNotesByCategory({
    category: "tech",
    order: "popular",
  })
  .then((data: CategorySearchResponse) => {
    console.log("Category Search Response:");
    console.log("Is Last Page:", data.is_last_page);
    console.log("Notes Count:", data.notes.length);
    console.log("\nNotes:");
    data.notes.slice(0, 3).forEach((note, index) => {
      console.log(`\nNote ${index + 1}:`);
      console.log("  Title:", note.name);
      console.log("  Author:", note.user.nickname);
      console.log("  Like Count:", note.like_count);
      console.log("  Price:", note.price);
    });
  });
