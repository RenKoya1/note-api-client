import { NoteAPIClient } from "../src";
import dotenv from "dotenv";
dotenv.config();
export const client = new NoteAPIClient(undefined, process.env.PROXY_URL);
