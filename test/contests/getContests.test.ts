import { client } from "..";

client.getContests({}).then((data: any) => {
  console.log(data);
});
