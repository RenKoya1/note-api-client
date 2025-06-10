import { client } from "..";

client
  .searchArticlesByKeyword({
    keyword: "AI",
  })
  .then((data: any) => {
    console.log(data);
  });
