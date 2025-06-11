import { client } from "..";

client.getRecommendMetadata({}).then((data: any) => {
  console.log(data);
});
