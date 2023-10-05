import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import getLTS from './lts_dashboard'
import { MongoClient } from "mongodb";
import getLeaderboard from './lts_leaderboard';
import getMatchups from './lts_matchups';
import getTeams from './lts_teams';
require('dotenv').config();

const atlasURI = process.env.ATLAS_MONGO_URI;

const PORT = process.env.PORT || 30030;

const LEAGUEID = Number(process.env.LEAGUEID) || 30030;

const client = new MongoClient(atlasURI!);
console.log("Attempting to connect to Mongo\n")

await client.connect();

console.log("Successfully connected to MongoDB\n")


const app = new Elysia()
  .use(cors())
  .get("/", () => {
    console.log("Endpoint: /");
    return "Hello LTS";
  })
  .get("/lts", (params) => {
    printCall("/lts",params.query);
    getLTS(client, false, params.query);
  })
  .get("/leaderboard", (params) => {
    printCall("/leaderboard",params.query);
    return getLeaderboard(client, params.query);
  })
  .get("/matchups", (params) => {
    printCall("/matchups",params.query);
    return getMatchups(client, params.query);
  })
  .get("/getTeams", (params) => {
    printCall("/getTeams",params.query);
    return getTeams(client, params.query);
  })
  .listen(PORT);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

function printCall(endpoint:string,params:any){
  console.log("Endpoint: " + endpoint);
  console.log("Params:", params);
}