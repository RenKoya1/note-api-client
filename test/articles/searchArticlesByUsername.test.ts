import { client } from "..";

client
  .searchArticlesByUsername({
    username: "ego_station",
  })
  .then((data: any) => {
    console.log(data.contents);
  });
