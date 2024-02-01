import { MongoClient } from "mongodb";

let cached_versus_data = {};

async function getVersusData(client, params) {



    const LEAGUEID = Number(params.league_id);

    const myTeamId = Number(params.my_team_id);

    const challengerId = Number(params.challenger_id);

    if (Number.isNaN(LEAGUEID) || Number.isNaN(myTeamId) || Number.isNaN(challengerId)) {
        return { "error": "Missing parameters" }
    }

    console.log('/versusData | league_id:' + params.league_id)


    let dbname = String(LEAGUEID) + '_fantasy_league'

    if (!LEAGUEID) {
        return {
            "error": "No year provided"
        }
    }

    const database = client.db(dbname);

    const matchups_collection = database.collection('Matchups');

    let filter_query = {
        $or: [
            { 'away_team_id': myTeamId, 'home_team_id': challengerId },
            { 'home_team_id': myTeamId, 'away_team_id': challengerId }
        ]
    };

    //remove lineups
    
    let projection = {
        'away_team_lineup': 0,
        'home_team_lineup': 0 
    };
    
    let matchups_data = await matchups_collection.find(filter_query, { projection: projection }).toArray();
    
    return matchups_data;
    
}

export default getVersusData;
