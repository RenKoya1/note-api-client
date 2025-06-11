import { client } from "..";

client
  .getComments({
    id: "88943926",
  })
  .then((data: any) => {
    console.log(data);
  });
