const api = {
    sumByName: (region, name) => `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}`,
    masteryById: (region, id) => `https://${region}.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${id}`,
    leaguesById: (region, id) => `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`,
};

const config = {
    headers: {'X-Riot-Token':`${process.env.RIOT_API}`}
};

module.exports = {api, config};