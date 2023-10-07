import { MongoClient } from "mongodb";

let cached_team_data:any = {};

async function getTeams(client:MongoClient,params:any)
{
    const LEAGUEID = params.league_id;

    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }

    console.log('/teams | league_id:' + params.league_id)

    if(cached_team_data["league_"+String(LEAGUEID)])
    {
        return cached_team_data["league_"+String(LEAGUEID)]
    }
    
    let dbname = String(LEAGUEID) + '_fantasy_league'

    const database = client.db(dbname);
            
    const teams_collection = database.collection('Teams');

    //add weekly filter later

    let team_data:any = await teams_collection.find().toArray();


    // each team has current year data and historical summed data
    let team_res:any = {
        "teams":{},
    }

    // console.log(Object.keys(draft_Data[0]['teams'][0]['team_id']))
    // console.log(draft_Data[0]['teams'][0]['team_id'])
    for(let i = 0;i<team_data.length;i++){
        // console.log(draft_Data[i])
        for(let j = 0; j < team_data[i]['teams'].length ; j++){
            if(Object.keys(team_res["teams"]).includes("team_"+String(team_data[i]['teams'][j]['team_id'])))
            {
                let tempTeam = team_res["teams"]["team_"+String(team_data[i]['teams'][j]['team_id'])];
                
                tempTeam["wins"] = tempTeam["wins"] + team_data[i]['teams'][j]['wins']
                tempTeam["playoff_wins"] = tempTeam["playoff_wins"] + team_data[i]['teams'][j]['playoff_wins']
                tempTeam["playoff_losses"] = tempTeam["playoff_losses"] + team_data[i]['teams'][j]['playoff_losses']
                tempTeam["trades"] = tempTeam["trades"] + team_data[i]['teams'][j]['trades']
                tempTeam["acquisitions"] = tempTeam["acquisitions"] + team_data[i]['teams'][j]['acquisitions']
                tempTeam["points_against"] = tempTeam["points_against"] + team_data[i]['teams'][j]['points_against']
                tempTeam["ties"] = tempTeam["ties"] + team_data[i]['teams'][j]['ties']
                tempTeam["championship_wins"] = tempTeam["championship_wins"] + team_data[i]['teams'][j]['championship_wins']
                tempTeam["losses"] = tempTeam["losses"] + team_data[i]['teams'][j]['losses']
                tempTeam["championship_losses"] = tempTeam["championship_losses"] + team_data[i]['teams'][j]['championship_losses']
                tempTeam["team_name"] = team_data[i]['teams'][j]['team_name']
                tempTeam["team_logo"] = team_data[i]['teams'][j]['logo_url']

                if(team_data[i]['teams'][j]['playoff_losses'] > 0 || team_data[i]['teams'][j]['playoff_wins'] > 0){
                   tempTeam["playoff_appearances"] = tempTeam["playoff_appearances"] + 1
                }

                team_res["teams"]["team_"+String(team_data[i]['teams'][j]['team_id'])] = tempTeam;
                
            }
            else{
                let tempTeam = team_data[i]['teams'][j];
                team_res["teams"]["team_"+String(team_data[i]['teams'][j]['team_id'])] = {
                    "playoff_wins":tempTeam['playoff_wins'],
                    "playoff_losses":tempTeam['playoff_losses'],
                    "trades":tempTeam['trades'],
                    "drops":tempTeam['wins'],
                    "acquisitions":tempTeam['acquisitions'],
                    "points_against":tempTeam['points_against'],
                    "ties":tempTeam['ties'],
                    "losses":tempTeam['losses'],
                    "wins":tempTeam['wins'],
                    "championship_wins":tempTeam['championship_wins'],
                    "championship_losses":tempTeam['championship_losses'],
                }
                if(tempTeam['playoff_wins'] > 0 || tempTeam["playoff_losses"] > 0){
                    team_res["teams"]["team_"+String(team_data[i]['teams'][j]['team_id'])]["playoff_appearances"] = 1
                }
                else{
                    team_res["teams"]["team_"+String(team_data[i]['teams'][j]['team_id'])]["playoff_appearances"] = 0
                }
            }
        }
    }

    let teams_final_var = {
        "curr_teams": team_data[team_data.length-1]['teams'],
        "historical_team_data":team_res["teams"]
    }

    cached_team_data["league_"+ String(LEAGUEID)] = teams_final_var
    
    return teams_final_var;
}

export default getTeams;