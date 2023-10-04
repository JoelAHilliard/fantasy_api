import { MongoClient } from "mongodb";

let cached_team_data:any = {};

async function getTeams(client:MongoClient,params:any)
{
    const LEAGUEID = params.league_id;

    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }

    if(cached_team_data["league_"+String(LEAGUEID)])
    {
        return cached_team_data["league_"+String(LEAGUEID)]
    }
    let dbname = String(LEAGUEID) + '_fantasy_league'
    const database = client.db(dbname);
            
    const matchups_collection = database.collection('Teams');

    //add weekly filter later

    let draft_Data:any = await matchups_collection.find().toArray();
    
    cached_team_data["league_"+String(LEAGUEID)] = draft_Data
    
    return draft_Data;
}

export default getTeams;