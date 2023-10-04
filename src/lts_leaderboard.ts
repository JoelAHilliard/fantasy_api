import { MongoClient } from "mongodb";

let leaderboard_data:any = {};

async function getLeaderboard(client:MongoClient,params:any){
    const LEAGUEID = Number(params.league_id);

    if(leaderboard_data["league_"+String(LEAGUEID)])
    {
        return leaderboard_data["league_"+String(LEAGUEID)]
    }
    let dbname = String(LEAGUEID) + '_fantasy_league'
    const database = client.db(dbname);
            
    const leaderboard_collection = database.collection('Leaderboard');
    
    const teams_collection = database.collection('Teams');

    let teams_filter_query = {'year':2023};

    let leaderboard_data_fetch = await leaderboard_collection.find().toArray();
    let teams_data = await teams_collection.find(teams_filter_query).toArray();

    let lb_data = leaderboard_data_fetch[0];
    let keys = Object.keys(leaderboard_data_fetch[0]);

    //remove useless "-id"
    keys = keys.slice(1,keys.length);

    // var to extract data from cursor
    let teams :any = {}

    for(let item in teams_data)
    {
        teams = teams_data[item]['teams']
    }
    for (let owner in keys)
    {
        for (let team in teams)
        {
            if(teams[team]['team_id'] == lb_data[keys[owner]]['team_id']){
                lb_data[keys[owner]]["wins"] = lb_data[keys[owner]]["wins"] + teams[team]['wins']
                lb_data[keys[owner]]["losses"] = lb_data[keys[owner]]["losses"] + teams[team]['losses']
                lb_data[keys[owner]]["points_for_alltime"] = lb_data[keys[owner]]["points_for_alltime"] + teams[team]['points_for']
                lb_data[keys[owner]]["points_against_alltime"] = lb_data[keys[owner]]["points_against_alltime"] + teams[team]['points_against']
                lb_data[keys[owner]]["aquisitions"] = lb_data[keys[owner]]["aquisitions"] + teams[team]['aquisitions']
                lb_data[keys[owner]]["drops"] = lb_data[keys[owner]]["drops"] + teams[team]['drops']
                lb_data[keys[owner]]["trades"] = lb_data[keys[owner]]["trades"] + teams[team]['trades']
            }
        }
    }
    
    leaderboard_data["league_"+String(LEAGUEID)] = [lb_data];

    return [lb_data];
}

export default getLeaderboard