import cors from 'cors';
import {getLTS} from './lts_dashboard.js'
import { MongoClient } from "mongodb";
import express from 'express';
import getLeaderboard from './lts_leaderboard.js';
import getMatchups from './lts_matchups.js';
import getTeams from './lts_teams.js';
import getVersusData from "./lts_versus_data.js";
import getInfo from './lts_info.js';
// const io = require('@pm2/io')

// io.init({
//   transactions: true, // will enable the transaction tracing
//   http: true // will enable metrics about the http server (optional)
// })

import dotenv from 'dotenv';
dotenv.config();


const atlasURI = process.env.ATLAS_MONGO_URI;

const client = new MongoClient(atlasURI);


async function main() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB\n");

    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json()); // For parsing application/json

    // Define routes
    app.get("/", (req, res) => res.send("Hello LTS"));
    app.get("/lts", async (req, res) => {
      const data = await getLTS(client, false, req.query);
      res.json(data);
    });
    app.get("/info", async (req, res) => {
      const data = await getInfo(client, req.query);
      res.json(data);
    });
    app.get("/leaderboard", async (req, res) => {
      const data = await getLeaderboard(client, req.query);
      res.json(data);
    });
    app.get("/matchups", async (req, res) => {
      const data = await getMatchups(client, req.query);
      res.json(data);
    });
    app.get("/getTeams", async (req, res) => {
      const data = await getTeams(client, req.query);
      res.json(data);
    });
    app.get("/getVersusData", async (req, res) => {
      const data = await getVersusData(client, req.query);
      res.json(data);
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
  }
}

main();