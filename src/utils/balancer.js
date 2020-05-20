const Player = require('../models/player')
const Combinatorics = require('js-combinatorics');
const { regions } = require('../utils/riotAPI');

const allRanked = players => players.every( player => { // boolean
    if(player.leagues){
        return player.leagues.solo
    } else {
        return false
    };
}); 

const allMastery = players => players.every( player => player.mastery ); // boolean

const sumPoints = (players, allPlayersAreRanked) => {
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

    const allPlayersAreRanked = allRanked(players);
    const totalPoints = sumPoints(players, allPlayersAreRanked);
    const teamMediaPoints = totalPoints / 2;

    const teamSize = Math.ceil(playersCount / 2);
    possibleTeams = Combinatorics.combination( players, teamSize ).toArray();

    const distancesToMedia = possibleTeams.map( team => {
        const teamPoints = sumPoints(team, allPlayersAreRanked);
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

    // console.log(
    //     'Min distance to media:',minDistanceToMedia,
    //     'Points Team A:', sumPoints(teamA, allPlayersAreRanked),
    //     'Points Team B:', sumPoints(teamB, allPlayersAreRanked),
    //     'Media:', teamMediaPoints,
    //     'Total:', totalPoints,
    // );

    match.teamA = teamA;
    match.teamB = teamB;

    return match;
};

module.exports = { balance, allRanked, allMastery };