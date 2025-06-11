import { client } from "..";

client.getHashtags({}).then((data: any) => {
  console.log(data);
});
