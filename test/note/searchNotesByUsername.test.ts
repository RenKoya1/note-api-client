import { client } from "..";
import { UserNotesResponse } from "../../src";

client
  .searchNotesByUsername({
    username: "ego_station",
  })
  .then((data: UserNotesResponse) => {
    console.log("User Notes Response:");
    console.log("Is Last Page:", data.isLastPage);
    console.log("Total Count:", data.totalCount);
    console.log("Notes Count:", data.contents.length);
    console.log("\nNotes:");
    data.contents.slice(0, 3).forEach((note, index) => {
      console.log(`\nNote ${index + 1}:`);
      console.log("  Title:", note.name);
      console.log("  Like Count:", note.likeCount);
      console.log("  Price:", note.price);
      console.log("  Published At:", note.publishAt);
      console.log("  Is Pinned:", note.isPinned);
      console.log("  Price Info:", JSON.stringify(note.priceInfo));
    });
  });
