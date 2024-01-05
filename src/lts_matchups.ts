import { MongoClient } from "mongodb";

let cached_matchup_data:any = {};

async function getMatchups(client:MongoClient,params:any)
{
    const year = Number(params.year);
    const LEAGUEID = Number(params.league_id);
    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }
    console.log('/matchups | league_id:' + params.league_id)

    let dbname = String(LEAGUEID) + '_fantasy_league_test'
    if(!year)
    {
        return{
            "error":"No year provided"
        }
    }
    
    let leagueKey = "league_" + String(LEAGUEID);
    if(cached_matchup_data[leagueKey]){
        if(cached_matchup_data[leagueKey][year]){
            return cached_matchup_data[leagueKey][year];
        }
    } else {
        cached_matchup_data[leagueKey] = {};  // Initialize the object if it doesn’t exist
    }
    
    const database = client.db(dbname);
            
    const matchups_collection = database.collection('Matchups');

    //add weekly filter later
    let filter_query = {'year':year};

    let matchups_data:any = await matchups_collection.find(filter_query).toArray();
    
    cached_matchup_data[leagueKey][year] = matchups_data;  // Now it won’t throw an error
    
    return matchups_data;
}

export default getMatchups;
