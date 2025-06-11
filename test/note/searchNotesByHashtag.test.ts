import { client } from "..";

client
  .searchNotesByHashtag({
    hashtag: "AI",
    order: "new",
    paid_only: true,
  })
  .then((data: any) => {
    console.log(data);
  });
