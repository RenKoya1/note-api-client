import { client } from "..";

client
  .searchUserByUsername({
    username: "notepecora",
  })
  .then((data: any) => {
    console.log(data);
  });
