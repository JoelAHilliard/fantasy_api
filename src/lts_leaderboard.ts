import { listen } from "bun";
import { privateEncrypt } from "crypto";
import { MongoClient } from "mongodb";

let leaderboard_data:any = {};

async function getLeaderboard(client:MongoClient,params:any){
    const LEAGUEID = Number(params.league_id);
    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }

    console.log('/leaderboard | league_id:' + params.league_id)

    if(leaderboard_data["league_"+String(LEAGUEID)])
    {
        return leaderboard_data["league_"+String(LEAGUEID)]
    }
    let dbname = String(LEAGUEID) + '_fantasy_league_test'
    const database = client.db(dbname);
            
    const teams_collection = database.collection('Teams');

    let teams_filter_query = {};

    // Specify the projection to get only the "alltime_stats" field
    let projection = {
        projection: {
            _id: 0,  // Assuming you don't want the "_id" field
            alltime_stats: 1
        }
    };
    let teams_data = await teams_collection.find(teams_filter_query, projection).toArray();

    const allTimeStats = teams_data[0]['alltime_stats'];

    // Convert object to array and include the team key/ID in the values
    let team_arr = []
    let keys = Object.keys(allTimeStats);
    for(let i = 0;i<keys.length;i++){
        team_arr.push(allTimeStats[keys[i]])
    }

    team_arr.sort((a,b) => b["wins"] - a["wins"])

    leaderboard_data["league_"+String(LEAGUEID)] = team_arr;
   

    return team_arr;
}

export default getLeaderboard