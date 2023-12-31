import { MongoClient } from "mongodb";

let cached_team_data:any = {};

function rankTeams(teams:any, category:any) {
    // Sort the teams by the category
    const sortedTeams = teams.slice().sort((a:any, b:any) => b[category] - a[category]);

    let rank = 1;
    for(let i = 0; i < sortedTeams.length; i++) {
        // Add the "T-" prefix if the current team is tied with the next, or if it was tied with the previous
        if (i < sortedTeams.length - 1 && sortedTeams[i][category] === sortedTeams[i + 1][category] || 
            i > 0 && sortedTeams[i][category] === sortedTeams[i - 1][category]) {
            sortedTeams[i][category + 'Rank'] = "T-" + rank;
        } else {
            sortedTeams[i][category + 'Rank'] = rank;
        }

        // Increment the rank only if the current team is not tied with the next one
        if (i === sortedTeams.length - 1 || sortedTeams[i][category] !== sortedTeams[i + 1][category]) {
            rank++;
        }
    }
}


function rankHistoricalTeams(teams:any, category:any) {
    // Sort the teams by the category
    const sortedTeams = teams.sort((a:any, b:any) => {
        return b["historical_stats"][category] - a["historical_stats"][category]
    });

    let rank = 1;
    for(let i = 0; i < sortedTeams.length; i++) {
        // If the current team is tied with the next one or if it was tied with the previous one
        if (i < sortedTeams.length - 1 && sortedTeams[i]["historical_stats"][category] === sortedTeams[i + 1]["historical_stats"][category] || 
            i > 0 && sortedTeams[i]["historical_stats"][category] === sortedTeams[i - 1]["historical_stats"][category]) {
            sortedTeams[i]["historical_stats"][category + 'Rank'] = "T-" + rank;
        } else {
            sortedTeams[i]["historical_stats"][category + 'Rank'] = rank;
        }
        
        // Increment the rank only if the current team is not tied with the next one
        if (i === sortedTeams.length - 1 || sortedTeams[i]["historical_stats"][category] !== sortedTeams[i + 1]["historical_stats"][category]) {
            rank++;
        }
    }
}


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
    
    let dbname = String(LEAGUEID) + '_fantasy_league_test'

    const database = client.db(dbname);
            
    const teams_collection = database.collection('Teams');

    const info_collection = database.collection('Info');

    let year = await info_collection.find({"year":1})

    //add weekly filter later

    let team_data = await teams_collection.find(
        {}, // This is your filter. Empty means no filter, or you can specify conditions here.
        {
            projection: {
                alltime_stats: 1, 
                [`yearly_stats.${2023}`]: 1 
            }
        }
    ).toArray();


    // each team has current year data and historical summed data
    let team_res:any = {
        "teams":{},
    }

    return team_data

    for(let i = 0;i<team_data.length;i++){
        for(let j = 0; j < team_data[i]['teams'].length ; j++){
            if(Object.keys(team_res["teams"]).includes("team_"+String(team_data[i]['teams'][j]['team_id'])))
            {
                let tempTeam = team_res["teams"]["team_"+String(team_data[i]['teams'][j]['team_id'])];
                
                tempTeam["wins"] = tempTeam["wins"] + team_data[i]['teams'][j]['wins']
                tempTeam["trades"] = tempTeam["trades"] + team_data[i]['teams'][j]['trades']
                tempTeam["acquisitions"] = tempTeam["acquisitions"] + team_data[i]['teams'][j]['acquisitions']
                tempTeam["points_against"] = tempTeam["points_against"] + team_data[i]['teams'][j]['points_against']
                tempTeam["points_for"] = tempTeam["points_for"] + team_data[i]['teams'][j]['points_for']
                tempTeam["ties"] = tempTeam["ties"] + team_data[i]['teams'][j]['ties']
                tempTeam["losses"] = tempTeam["losses"] + team_data[i]['teams'][j]['losses']
                tempTeam["team_name"] = team_data[i]['teams'][j]['team_name']
                tempTeam["team_logo"] = team_data[i]['teams'][j]['logo_url']
                tempTeam["team_id"] = team_data[i]['teams'][j]['team_id']
                

                //test if undefinde as this included 2023 playoff team data which doesnt ecists
                if(team_data[i]['teams'][j]['playoff_wins'] !== undefined)
                {

                    tempTeam["playoff_wins"] = tempTeam["playoff_wins"] + team_data[i]['teams'][j]['playoff_wins']
                    tempTeam["playoff_losses"] = tempTeam["playoff_losses"] + team_data[i]['teams'][j]['playoff_losses']
                    tempTeam["championship_losses"] = tempTeam["championship_losses"] + team_data[i]['teams'][j]['championship_losses']
                    tempTeam["championship_wins"] = tempTeam["championship_wins"] + team_data[i]['teams'][j]['championship_wins']
                
                }

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
                    "points_for":tempTeam['points_for'],
                    "ties":tempTeam['ties'],
                    "losses":tempTeam['losses'],
                    "wins":tempTeam['wins'],
                    "championship_wins":tempTeam['championship_wins'],
                    "championship_losses":tempTeam['championship_losses'],
                }

                if(tempTeam['playoff_wins'] > 0 || tempTeam["playoff_losses"] > 0)
                {
                    team_res["teams"]["team_" + String(team_data[i]['teams'][j]['team_id'])]["playoff_appearances"] = 1
                }

                else
                {
                    team_res["teams"]["team_" + String(team_data[i]['teams'][j]['team_id'])]["playoff_appearances"] = 0
                }
            }
        }
    }


    let curr_teams = team_data[team_data.length-1]['teams'];

    for(let i = 0; i < curr_teams.length;i++)
    {
        let team_names = Object.keys(team_res["teams"]) 
        
        for(let j = 0; j < team_names.length; j++)
        {
            if(team_res["teams"][team_names[j]]["team_id"] == curr_teams[i]["team_id"])
            {
                curr_teams[i]["historical_stats"] = team_res["teams"][team_names[j]]
            }
        }
    }

    let categories = Object.keys(curr_teams[0]);

    categories.forEach(category=>{
        if(category === "streak_type"
        || category === "streak_length"
        || category === "owner"
        || category === "team_id"
        || category === "team_name"
        || category === "division_id"
        || category === "division_name"
        || category === "team_abbrev"
        || category === "roster"
        || category === "historical_stats"
        || category === "logo_url"
        || category === "final_standing"){}
        else{rankTeams(curr_teams,category)}
    })

    try{
        let historical_categories = Object.keys(curr_teams[0]["historical_stats"]);

        historical_categories.forEach(category=>{
            if(category === "streak_type"
            || category === "streak_length"
            || category === "owner"
            || category === "team_id"
            || category === "team_name"
            || category === "division_id"
            || category === "division_name"
            || category === "team_abbrev"
            || category === "roster"
            || category === "historical_stats"
            || category === "team_logo"
            || category === "final_standing"){}
            else{rankHistoricalTeams(curr_teams,category)}
        })
    }
    catch{

    }

    cached_team_data["league_"+ String(LEAGUEID)] = curr_teams
    
    return curr_teams;
}

export default getTeams;
