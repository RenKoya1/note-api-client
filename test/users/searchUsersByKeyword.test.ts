import { client } from "..";

client
  .searchUsersByKeyword({
    keyword: "AI",
  })
  .then((data: any) => {
    console.log(data);
  });
