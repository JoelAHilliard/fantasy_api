import { MongoClient } from "mongodb";

let cached_matchup_data:any = {};

async function getMatchups(client:MongoClient,params:any)
{
    const year = Number(params.year);
    const LEAGUEID = Number(params.league_id);
    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }

    let dbname = String(LEAGUEID) + '_fantasy_league'
    if(!year)
    {
        return{
            "error":"No year provided"
        }
    }
    
    if(cached_matchup_data["league_"+String(LEAGUEID)]){
        if(cached_matchup_data["league_"+String(LEAGUEID)][year]){
            return cached_matchup_data["league_"+String(LEAGUEID)][year];
        }
    }
    
    const database = client.db(dbname);
            
    const matchups_collection = database.collection('Matchups');

    //add weekly filter later
    let filter_query = {'year':year};

    let matchups_data:any = await matchups_collection.find(filter_query).toArray();
    
    cached_matchup_data["league_"+String(LEAGUEID)][year] = matchups_data;
    
    return matchups_data;
}

export default getMatchups;