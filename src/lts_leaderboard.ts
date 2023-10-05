import { listen } from "bun";
import { privateEncrypt } from "crypto";
import { MongoClient } from "mongodb";

let leaderboard_data:any = {};

async function getLeaderboard(client:MongoClient,params:any){
    const LEAGUEID = Number(params.league_id);
    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }
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

    if(keys.length == 0){
        let leaderboard: any = {}
        for (let item in teams_data)
        {
            if(teams_data[item]["year"] == 2023)
            {
                for(let team in teams_data[item]["teams"]){
                    leaderboard[("team_"+String(teams_data[item]["teams"][team]["team_id"]))] = {
                        "team_name":teams_data[item]["teams"][team].team_id,
                        "logo_url":teams_data[item]["teams"][team].logo_url,
                        "wins":teams_data[item]["teams"][team].wins,
                        "losses":teams_data[item]["teams"][team].losses,
                        "ties":teams_data[item]["teams"][team].ties,
                        "points_for_alltime":teams_data[item]["teams"][team].points_for,
                        "points_against_alltime":teams_data[item]["teams"][team].points_against,
                        "drops":teams_data[item]["teams"][team].drops,
                        "acquisitions":teams_data[item]["teams"][team].acquisitions,
                        "years_played":1
                    }
                }
            }
        }
        return [leaderboard];
    }





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
            let team_id = keys[owner];

            team_id = team_id.substring(5);
            if(teams[team]['team_id'] == team_id){
                
                console.log(teams[team].acquisitions, lb_data[keys[owner]].acquisitions);
                
                lb_data[keys[owner]]["wins"] = lb_data[keys[owner]]["wins"] + teams[team]['wins']
                lb_data[keys[owner]]["losses"] = lb_data[keys[owner]]["losses"] + teams[team]['losses']
                lb_data[keys[owner]]["points_for_alltime"] = lb_data[keys[owner]]["points_for_alltime"] + teams[team]['points_for']
                lb_data[keys[owner]]["points_against_alltime"] = lb_data[keys[owner]]["points_against_alltime"] + teams[team]['points_against']
                lb_data[keys[owner]].acquisitions = lb_data[keys[owner]].acquisitions + teams[team].acquisitions
                lb_data[keys[owner]]["drops"] = lb_data[keys[owner]]["drops"] + teams[team]['drops']
                lb_data[keys[owner]]["trades"] = lb_data[keys[owner]]["trades"] + teams[team]['trades']
            }
        }
    }
    
    leaderboard_data["league_"+String(LEAGUEID)] = [lb_data];
    console.log(lb_data)
    return [lb_data];
}

export default getLeaderboard