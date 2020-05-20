const Player = require('../models/player')
const { regions } = require('../utils/riotAPI');

// Get players in parallel
const getPlayers = async (region, summonerNames) => {
    const promises = summonerNames.map( name => {
        const cachedPlayer = Player.find({region, name});
        if(cachedPlayer) return cachedPlayer;
        const player = new Player(region, name);
        return player.syncSummonerInfo();
    }); // This will make all the requests in parallel
    try {
        const players = await Promise.all(promises);
        const errors = players.filter( player => player.error);
        if(errors.length > 0){
            const namesNotFound = errors.filter(error => error.code === 404).map( error => error.name );
            
            if(namesNotFound.length > 0){
                return{
                    error: `The following players doesn't exist in ${regions.get(region)}: ${namesNotFound.join(', ')}.`,
                    names: namesNotFound, 
                    code: 404,
                    source: 'Get players'
                };
            }else{
                return {error: 'Internal server error', code: 500, source: 'Get players' };
            };
        } else {
            return players;
        };
    } catch (error){
        return {error: 'Internal server error', code: 500, source: 'Get players' };
    };
};

const getLeagues = async players => {
    const promises = players.map( player => {
        if(player.leagues) return player; // This means that the player and its leagues property are already synchronized
        return player.syncLeagues();
    });
    try{
        const players = await Promise.all(promises); // Not dealing with individual errors
        return players;
    } catch (error){
        return {error: 'Internal server error', code: 500, source: 'Get leagues'};
    };
};

const getMastery = async players => {
    const promises = players.map( player => {
        if(player.mastery) return player; // This means that the player and its mastery property are already synchronized
        return player.syncMastery();
    });
    try{
        const players = await Promise.all(promises); // Not dealing with individual errors
        return players;
    } catch (error){
        return {error: 'Internal server error', code: 500, source: 'Get mastery' };
    };
};

module.exports = { getPlayers, getLeagues, getMastery };