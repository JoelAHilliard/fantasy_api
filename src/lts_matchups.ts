import { MongoClient } from "mongodb";

let cached_matchup_data:any = {};

async function getMatchups(client:MongoClient,params:any,LEAGUEID:number)
{
    const year = Number(params.year);
    let dbname = String(LEAGUEID) + '_fantasy_league'
    if(!year)
    {
        return{
            "error":"No year provided"
        }
    }
    
    if(cached_matchup_data[year]){
        return cached_matchup_data[year];
    }
    
    const database = client.db(dbname);
            
    const matchups_collection = database.collection('Matchups');

    //add weekly filter later
    let filter_query = {'year':year};

    let matchups_data:any = await matchups_collection.find(filter_query).toArray();
    
    cached_matchup_data[year] = matchups_data;
    
    return matchups_data;
}

export default getMatchups;