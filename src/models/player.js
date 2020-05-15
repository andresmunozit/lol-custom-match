const axios = require('axios');
const { api, config } = require('../utils/riotApi');

class Player {
    constructor(name, region){
        this.name = name;
        this.region = region;
        this.id = undefined;
        this.profileIconId = undefined;
        this.mastery = undefined;
        this.leagues = undefined;
    };
};

Player.prototype.sync = async function(){
    const region = this.region;
    const name = this.name;
    
    try{
        const summonerInfo = await axios.get(api.sumByName(region, name), config);
        this.id = summonerInfo.data.id;
        this.profileIconId = summonerInfo.data.profileIconId;

        const masteryData = await axios.get(api.masteryById(region, this.id), config);
        this.mastery = masteryData.data;

        const leaguesData = await axios.get(api.leaguesById(region, this.id), config);
        this.leagues = leaguesData.data.map(league => {
            return {
                queueType: league.queueType ,
                tier: league.tier ,
                rank: league.rank ,
                leaguePoints: league.leaguePoints ,
            }
        });

        return this;
    } catch (e){
        return {error: e.toString()};
    };
};

module.exports = Player;