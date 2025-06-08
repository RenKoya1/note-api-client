import { client } from "..";

client
  .getArticlesByUsername({
    username: "ego_station",
  })
  .then((data: any) => {
    console.log(data.contents);
  });
