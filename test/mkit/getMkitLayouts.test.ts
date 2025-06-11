import { client } from "..";

client
  .getMkitLayouts({
    context: "category_challenge",
    page: 1,
  })
  .then((data: any) => {
    console.log(data);
  });
