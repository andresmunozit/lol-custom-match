const Player = require('../models/player')

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

const balanceByMastery = players => {
    const totalPlayers = players.length;
    const match = {teamA: [], teamB: []};

    if(totalPlayers === 2){
        match.teamA.push( players[0] );
        match.teamB.push( players[1] );
        return match;
    };

    const totalMastery = players.reduce( (acc, player) => acc + player.mastery, 0);
    const media = Math.floor( totalMastery / totalPlayers );


    return totalMastery;
};

module.exports = { getPlayers, balance, balanceByMastery };