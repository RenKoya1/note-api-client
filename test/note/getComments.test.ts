import { client } from "..";
import { CommentsResponse } from "../../src";

client
  .getComments({
    id: "88943926",
  })
  .then((data: CommentsResponse) => {
    console.log("Comments Response:");
    console.log("Comment Count:", data.comments.length);
    console.log("Remaining Comments:", data.rest_comment_count);
    data.comments.forEach((comment, index) => {
      console.log(`\nComment ${index + 1}:`);
      console.log("  User:", comment.user.nickname);
      console.log("  Content:", comment.comment);
      console.log("  Likes:", comment.like_count);
      console.log("  Created At:", comment.created_at);
    });
  });
