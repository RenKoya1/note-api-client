import { client } from "..";

client
  .searchNotesByCategory({
    category: "tech",
    order: "popular",
  })
  .then((data: any) => {
    console.log(data);
  });
