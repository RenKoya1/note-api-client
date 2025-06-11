import { client } from "..";

client
  .getFollowings({
    key: "b4f68623c9bed147dbf77e17fd592b64",
  })
  .then((data: any) => {
    console.log(data);
  });
