import { client } from "..";

client
  .searchUserByUsername({
    username: "notepecora",
  })
  .then((data) => {
    console.log(data);
  });
