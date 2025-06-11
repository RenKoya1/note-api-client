import { client } from "..";

client.getCategories({}).then((data: any) => {
  console.log(data);
});
