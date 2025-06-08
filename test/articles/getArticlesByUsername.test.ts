import { client } from "..";

client
  .getArticlesByUsername({
    username: "hitsuji_fire",
  })
  .then((data: any) => {
    console.log(data.contents);
  });
