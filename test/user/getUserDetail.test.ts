import { client } from "..";

client
  .getUserDetail({
    username: "grmiyamae",
  })
  .then((data: any) => {
    console.log(data);
  });
