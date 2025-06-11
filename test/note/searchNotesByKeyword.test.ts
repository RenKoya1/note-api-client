import { client } from "..";

client
  .searchNotesByKeyword({
    keyword: "AI",
  })
  .then((data: any) => {
    console.log(data);
  });
