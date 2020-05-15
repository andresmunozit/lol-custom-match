const Player = require('../models/player')
const Combinatorics = require('js-combinatorics');

// sumName = summoner names
const getPlayers = async (region, sumNames) => {
    const players = [];

    // Map doesn't support async/await so "for" loop is used
    for (let i = 0; i < sumNames.length; i++) {
        const sumName = sumNames[i];
        const player = new Player (sumName, region);

        const riotPlayer = await player.sync();
        if(riotPlayer.error) return {error: riotPlayer.error};

        players.push({...riotPlayer});        
    };

    return players
};

const balance = players => {
    // Todo
};

// Return the sum of mastery for an array of players (a team is an array of players)
const sumMastery = players => {   
    return players.reduce( (acc, player) => acc + player.mastery, 0)
};

const balanceByMastery = players => {
    const playersCount = players.length;
    const match = {};
    let possibleTeams;

    if(playersCount === 2) return {teamA: [ players[0] ], teamB: [ players[1] ] };

    const totalMastery = sumMastery(players);
    const mediaMastery = totalMastery / 2;

    if ( playersCount % 2 === 0 ){ // Even number of players
        const teamSize = parseInt(playersCount / 2);
        possibleTeams = Combinatorics.combination( players, teamSize ).toArray();
    } else { // Odd number of players
        const smallTeamSize = Math.floor(playersCount / 2);
        const bigTeamSize = Math.ceil(playersCount / 2);

        const possibleSmallTeams = Combinatorics.combination( players, smallTeamSize ).toArray();
        const possibleBigTeams = Combinatorics.combination( players, bigTeamSize ).toArray();

        possibleTeams = [...possibleSmallTeams, ...possibleBigTeams];
    };

    // A team is an array of players
    const distancesToMedia = possibleTeams.map( team => {
        const teamMastery = sumMastery(team);
        const distanceToMedia = Math.abs(mediaMastery - teamMastery);
        return distanceToMedia;
    });

    const minDistanceToMedia = Math.min(...distancesToMedia);
    const indexOfBestMatch = distancesToMedia.indexOf(minDistanceToMedia);
    
    const teamA = possibleTeams[indexOfBestMatch];
    const teamAIDs = teamA.map( player => player.id );
    
    const teamB = players.filter( player => !teamAIDs.includes(player.id) );

    match.teamA = teamA;
    match.teamB = teamB;

    return match;
};

// console.log( team, {totalMastery}, {teamMastery}, {mediaMastery}, {distanceToMedia} )


module.exports = { getPlayers, balance, balanceByMastery };