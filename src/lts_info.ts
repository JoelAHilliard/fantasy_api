import { MongoClient } from "mongodb";

let cached_matchup_data:any = {};

async function getInfo(client:MongoClient,params:any)
{
    const LEAGUEID = Number(params.league_id);
    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }
    console.log('/info | league_id:' + params.league_id)

    let dbname = String(LEAGUEID) + '_fantasy_league_prod'
   
    
    let leagueKey = "league_" + String(LEAGUEID);
    if(cached_matchup_data[leagueKey]){
        if(cached_matchup_data[leagueKey]){
            return cached_matchup_data[leagueKey];
        }
    } else {
        cached_matchup_data[leagueKey] = {};  // Initialize the object if it doesn’t exist
    }
    
    const database = client.db(dbname);
            
    const matchups_collection = database.collection('Info');

    let projection = { projection: { prevSeasons: 1 } };
    
    let info_data:any = await matchups_collection.find({}, projection).toArray();
    
    info_data[0]['prevSeasons'].push(2023);

    cached_matchup_data[leagueKey] = info_data;  // Now it won’t throw an error
    
    return info_data;
}

export default getInfo;
