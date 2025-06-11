import { client } from "..";

client
  .searchNotesByHashtag({
    hashtag: "AI",
    order: "new",
  })
  .then((data: any) => {
    console.log(data);
  });
