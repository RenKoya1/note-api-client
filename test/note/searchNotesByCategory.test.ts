import { client } from "..";

client
  .searchNotesByCategory({
    category: "tech",
  })
  .then((data: any) => {
    console.log(data);
  });
