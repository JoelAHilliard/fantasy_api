import { MongoClient } from "mongodb";

///used for caching
let league_data:any = {};
//ts-nocheck
function generateBestRoster(boxScores:any) {
    const perfectRoster = {
        "QB": [],
        "RB": [],
        "WR": [],
        "TE": [],
        "FLEX": [],
        "D/ST": [],
        "K": []
    };

    let flexCandidates = [];

    for (const boxScore of boxScores) {
        for (let player of (boxScore.home_team_lineup || [])) {
            player.owner_team_name = boxScore.home_team;  // Assign home team name
    
            // Process the player (example for QB, you can add more positions)
            switch (player.position) {
                case "QB":
                    if (!perfectRoster.QB[0] || perfectRoster.QB[0].points < player.points) {
                        perfectRoster.QB = [player]
                    }
                    break;
                case "RB":
                    perfectRoster.RB.push(player);
                    break;
                case "WR":
                    perfectRoster.WR.push(player);
                    break;
                case "TE":
                    if (!perfectRoster.TE[0] || perfectRoster.TE[0].points < player.points) {
                        perfectRoster.TE = [player];
                    }
                    break;
                case "D/ST":
                    if (!perfectRoster["D/ST"][0] || perfectRoster["D/ST"][0].points < player.points) {
                        perfectRoster["D/ST"] = [player];
                    }
                    break;
                case "K":
                    if (!perfectRoster.K[0] || perfectRoster.K[0].points < player.points) {
                        perfectRoster.K = [player];
                    }
                    break;
                default:
                    flexCandidates.push(player);
            }
        }
        for (let player of (boxScore.away_team_lineup || [])) {
            player.owner_team_name = boxScore.away_team;  // Assign home team name
    
            // Process the player (example for QB, you can add more positions)
            switch (player.position) {
                case "QB":
                    if (!perfectRoster.QB[0] || perfectRoster.QB[0].points < player.points) {
                        perfectRoster.QB = [player]
                    }
                    break;
                case "RB":
                    perfectRoster.RB.push(player);
                    break;
                case "WR":
                    perfectRoster.WR.push(player);
                    break;
                case "TE":
                    if (!perfectRoster.TE[0] || perfectRoster.TE[0].points < player.points) {
                        perfectRoster.TE = [player];
                    }
                    break;
                case "D/ST":
                    if (!perfectRoster["D/ST"][0] || perfectRoster["D/ST"][0].points < player.points) {
                        perfectRoster["D/ST"] = [player];
                    }
                    break;
                case "K":
                    if (!perfectRoster.K[0] || perfectRoster.K[0].points < player.points) {
                        perfectRoster.K = [player];
                    }
                    break;
                default:
                    flexCandidates.push(player);
            }
        }
    }

    perfectRoster.RB.sort((a, b) => b.points - a.points);
    perfectRoster.WR.sort((a, b) => b.points - a.points);
    flexCandidates.push(...perfectRoster.RB.slice(2), ...perfectRoster.WR.slice(2));
    if (perfectRoster.TE) flexCandidates.push(perfectRoster.TE);
    flexCandidates.sort((a, b) => b.points - a.points);

    perfectRoster.RB = perfectRoster.RB.slice(0, 2);
    perfectRoster.WR = perfectRoster.WR.slice(0, 2);
    perfectRoster.FLEX = [flexCandidates[0]];

    return perfectRoster;
}



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
    let dbname = String(LEAGUEID) + '_fantasy_league_prod'

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

    let matchups_data:any = await matchups_collection.find(filter_query).toArray();
    
    let matchups: any = [];

    let standings: any = league_info_data[0].standings;
    
    let power_rankings: any = league_info_data[0].pwrRankings;
    let prevSeasons: any = league_info_data[0].prevSeasons;
    
    //left off here - generate perf roster here
    let perfect_roster = generateBestRoster(matchups_data);

    for (let item in matchups_data)
    {
        matchups_data[item]['_id'] = String(matchups_data[item]['_id'])
        matchups.push(matchups_data[item]);
    }


    delete league_info_data[0].standings
    delete league_info_data[0].pwrRankings
    delete league_info_data[0].top_roster

    // perfect_roster["FLEX"] = [perfect_roster["FLEX"]]
    const res = {
        "matchups": matchups,
        "power_rankings": power_rankings,
        "standings": standings,
        "perfect_roster": perfect_roster,
        "prevSeasons": prevSeasons,
        "info":{
            "currentWeek": league_info_data[0].currentWeek
        }
    }

    league_data["league_"+String(LEAGUEID)+"_"+String(WEEK)] = res;

    return res;
}

export default getLTS;
