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

    static totalLeaguePoints(tier, rank, leaguePoints){
        const tiers = ['IRON','BRONZE','SILVER','GOLD','PLATINUM','DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
        const ranks = ['I','II','III','IV'];
        
        const tierPoints = tiers.indexOf(tier) * 400;
        const rankPoints = ranks.indexOf(rank) * 100;

        return tierPoints + rankPoints + leaguePoints;
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
        this.leagues = {};
        leaguesData.data.forEach( league => {
            const { tier, rank, leaguePoints, queueType } = league;
            if(league.queueType === 'RANKED_SOLO_5x5') {
                this.leagues.solo = { tier, rank, leaguePoints };
                this.leagues.solo.totalLeaguePoints = Player.totalLeaguePoints( tier, rank, leaguePoints );
            } 
        });

        return this;
    } catch (e){
        return {error: e.toString()};
    };
};

module.exports = Player;