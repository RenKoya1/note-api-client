import { client } from "..";

client
  .getMagazineDetail({
    key: "m891c62a08b36",
  })
  .then((data: any) => {
    console.log(data);
  });
