import { privateEncrypt } from "crypto";
import { MongoClient } from "mongodb";

///used for caching
let league_data:any = {};

async function getLTS(client:MongoClient,refresh:boolean,params:any)
{
    const LEAGUEID = Number(params.league_id);
    let WEEK = Number(params.week);
    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }
    if(Number.isNaN(WEEK)){
        WEEK = 17
    }
    console.log('/lts | league_id:' + params.league_id)

    if(league_data["league_"+String(LEAGUEID)+"_"+String(WEEK)])
    {
        return league_data["league_"+String(LEAGUEID)+"_"+String(WEEK)];
    }
    let dbname = String(LEAGUEID) + '_fantasy_league_test'

    const database = client.db(dbname);
            
    const matchups_collection = database.collection('Matchups');
    
    const teams_collection = database.collection('Teams');

    const league_info = database.collection('Info');

    const league_info_data = await league_info.find().toArray();

    let current_week = league_info_data[0].currentWeek;
    let year = league_info_data[0].year;

    if(Number.isNaN(WEEK)){
        WEEK = current_week
    }

    let filter_query = {'year':year,'week':WEEK};

    let teams_filter_query = { "yearly_stats.2023": { $exists: true } }

    let matchups_data:any = await matchups_collection.find(filter_query).toArray();
    
    let matchups: any = [];

    let standings: any = league_info_data[0].standings
    
    let power_rankings: any = league_info_data[0].pwrRankings
    //left off here
    let perfect_roster = league_info_data[0].top_roster;

    for (let item in matchups_data)
    {
        matchups_data[item]['_id'] = String(matchups_data[item]['_id'])
        matchups.push(matchups_data[item]);
    }


    delete league_info_data[0].standings
    delete league_info_data[0].pwrRankings
    delete league_info_data[0].top_roster

    perfect_roster["FLEX"] = [perfect_roster["FLEX"]]

    const res = {
        "matchups": matchups,
        "power_rankings": power_rankings,
        "standings": standings,
        "perfect_roster": perfect_roster,
        "info":{
            "currentWeek":league_info_data[0].currentWeek
        }
    }

    league_data["league_"+String(LEAGUEID)+"_"+String(WEEK)] = res;

    return res;
}

export default getLTS;
