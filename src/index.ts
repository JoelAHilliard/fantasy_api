import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import getLTS from './lts_dashboard'
import { MongoClient } from "mongodb";
import getLeaderboard from './lts_leaderboard';
import getMatchups from './lts_matchups';
import getTeams from './lts_teams';
import getVersusData from "./lts_versus_data";

require('dotenv').config();

const atlasURI = process.env.ATLAS_MONGO_URI;

const PORT = 3000;

const client = new MongoClient(atlasURI!);

console.log("Attempting to connect to Mongo\n")

await client.connect();

console.log("Successfully connected to MongoDB\n")


const app = new Elysia()
  .use(cors())
  .get("/", () => "Hello LTS")
  .get("/lts", (params) => getLTS(client,false,params.query))
  .get("/leaderboard", (params) => getLeaderboard(client,params.query))
  .get("/matchups", (params) => getMatchups(client,params.query))
  .get("/getTeams", (params) => getTeams(client,params.query))
  .get("/getVersusData", (params) => getVersusData(client,params.query))
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

