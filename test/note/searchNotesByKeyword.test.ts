import { client } from "..";

client
  .searchNotesByKeyword({
    keyword: "AI",
  })
  .then((data: any) => {
    console.log(data);
    console.log("======");
    console.log(data.notes.contents[0].price_info);
  });
