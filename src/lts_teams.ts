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
    const YEAR = params.year;
    if(Number.isNaN(LEAGUEID)){
        return {"error":"Must pass League_ID"}
    }

    console.log('/teams | league_id:' + params.league_id)

    if(cached_team_data["league_"+String(LEAGUEID)+String(YEAR)])
    {
        return cached_team_data["league_"+String(LEAGUEID)+String(YEAR)]
    }
    
    let dbname = String(LEAGUEID) + '_fantasy_league_prod'

    const database = client.db(dbname);
            
    const teams_collection = database.collection('Teams');

    const info_collection = database.collection('Info');

    //add weekly filter later

    let team_data = await teams_collection.find(
        {}, // This is your filter. Empty means no filter, or you can specify conditions here.
        {
            projection: {
                alltime_stats: 1, 
                [`yearly_stats.${YEAR}`]: 1 
            }
        }
    ).toArray();

    return team_data

}

export default getTeams;
