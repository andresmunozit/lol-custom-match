const Player = require('../models/player')
const Combinatorics = require('js-combinatorics');
const { regions } = require('../utils/riotAPI');

// sumName = summoner names
const getPlayers = async (region, sumNames) => {
    const players = [];

    // Map doesn't support async/await so "for" loop is used
    for (let i = 0; i < sumNames.length; i++) {
        const sumName = sumNames[i];
        const player = new Player (region, sumName);
        const riotPlayer = await player.sync();
        if(riotPlayer.error) return {error: riotPlayer.error};
        players.push({...riotPlayer});        
    };

    return players
};

const allRanked = players => players.every( player => {
    if(player.leagues){
        return player.leagues.solo
    } else {
        return false
    };
}); // boolean

const allMastery = players => players.every( player => player.mastery ); // boolean

const sumPoints = players => {
    const allPlayersAreRanked = allRanked(players);
    return players.reduce( (acc, player) => {
        const leaguePoints = player.leagues.solo ? player.leagues.solo.totalLeaguePoints : 0;
        const masteryPoints = player.mastery;
        const totalPoints = allPlayersAreRanked ? leaguePoints : leaguePoints + masteryPoints;
        return acc + totalPoints;
    }, 0);
};

const balance = players => {
    const playersCount = players.length;
    const match = {};
    let possibleTeams;

    if(playersCount === 2) return {teamA: [ players[0] ], teamB: [ players[1] ] };

    const totalPoints = sumPoints(players);
    const teamMediaPoints = totalPoints / 2;

    const teamSize = Math.ceil(playersCount / 2);
    possibleTeams = Combinatorics.combination( players, teamSize ).toArray();

    const distancesToMedia = possibleTeams.map( team => {
        const teamPoints = sumPoints(team);
        const distanceToMedia = Math.abs(teamMediaPoints - teamPoints);
        // console.log( team, {totalPoints}, {teamPoints}, {teamMediaPoints}, {distanceToMedia} )
        return distanceToMedia;
    });

    // console.log(distancesToMedia);

    const minDistanceToMedia = Math.min(...distancesToMedia);
    const indexOfBestMatch = distancesToMedia.indexOf(minDistanceToMedia);
    
    const teamA = possibleTeams[indexOfBestMatch];
    const teamAIDs = teamA.map( player => player.id );
    
    const teamB = players.filter( player => !teamAIDs.includes(player.id) );

    match.teamA = teamA;
    match.teamB = teamB;

    return match;
};

module.exports = { getPlayers, balance, allRanked, allMastery };