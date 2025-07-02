import { client } from "..";

client
  .searchNotesByUsername({
    username: "ego_station",
  })
  .then((data: any) => {
    console.log(data);
  });
