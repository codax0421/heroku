import server from "./server.js";
import mongo from "./mongo.js";
import { v4 as uuidv4 } from "uuid";

mongo.connect();

const port = process.env.PORT || 4000;

server.listen({ port }, () => {
  console.log(`The server is up on port ${port}!`);
});
