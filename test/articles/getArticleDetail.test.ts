import { client } from "..";

client
  .getArticleDetail({
    key: "n1a0b26f944f4",
  })
  .then((data: any) => {
    console.log(data);
  });
