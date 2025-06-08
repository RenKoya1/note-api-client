import { client } from "..";

client
  .getArticlesByKeyword({
    keyword: "AI",
  })
  .then((data: any) => {
    console.log(data);
  });
