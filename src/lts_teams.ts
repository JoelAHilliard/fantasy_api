import { MongoClient } from "mongodb";

let cached_draft_data:any = {};

async function getTeams(client:MongoClient,params:any)
{
    const LEAGUEID = params.league_id;

    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }
    let dbname = String(LEAGUEID) + '_fantasy_league'
    const database = client.db(dbname);
            
    const matchups_collection = database.collection('Teams');

    //add weekly filter later

    let draft_Data:any = await matchups_collection.find().toArray();
    
    return draft_Data;
}

export default getTeams;