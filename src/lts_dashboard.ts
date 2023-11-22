import { privateEncrypt } from "crypto";
import { MongoClient } from "mongodb";

///used for caching
let league_data:any = {};

async function getLTS(client:MongoClient,refresh:boolean,params:any)
{
    const LEAGUEID = Number(params.league_id);
    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }
    console.log('/lts | league_id:' + params.league_id)

    if(league_data["league_"+String(LEAGUEID)])
    {
        return league_data["league_"+String(LEAGUEID)];
    }
    let dbname = String(LEAGUEID) + '_fantasy_league'

    const database = client.db(dbname);
            
    const matchups_collection = database.collection('Matchups');
    
    const teams_collection = database.collection('Teams');

    let filter_query = {'year':2023,'week':11};
    let teams_filter_query = {'year':2023};

    let matchups_data:any = await matchups_collection.find(filter_query).toArray();
    let teams_data:any = await teams_collection.find(teams_filter_query).toArray();

    let matchups: any = [];
    let misc_data: any = {};
    let perfect_roster: any = {};
    let power_rankings: any = [];

    for (let item in matchups_data)
    {
        matchups_data[item]['_id'] = String(matchups_data[item]['_id'])
        matchups.push(matchups_data[item]);
    }

    for(let item in teams_data)
    {
        power_rankings.push(teams_data[item]['power_rankings'])
        misc_data = teams_data[item]['misc_data']
        perfect_roster = teams_data[item]['perfect_roster']
    }

    const res = {
        "matchups": matchups,
        "power_rankings": power_rankings,
        "misc_data": misc_data,
        "perfect_roster": perfect_roster
    }

    league_data["league_"+String(LEAGUEID)] = res;

    return res;
}

export default getLTS;
