const Player = require('../models/player')
// sumName = summoner names

const players = async (region, ...sumNames) => {
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

module.exports = { players };