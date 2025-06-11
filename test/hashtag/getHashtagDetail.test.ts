import { client } from "..";

client
  .getHashtagDetail({
    hashtag: "AI",
  })
  .then((data: any) => {
    console.log(data);
  });
