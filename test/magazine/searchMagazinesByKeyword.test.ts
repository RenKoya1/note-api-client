import { client } from "..";

client
  .searchMagazinesByKeyword({
    keyword: "AI",
  })
  .then((data: any) => {
    console.log(data.magazines);
  });
