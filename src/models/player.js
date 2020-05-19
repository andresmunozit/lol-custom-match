const axios = require('axios');
const { api, config, apiErrors } = require('../utils/riotAPI');

class Player {
    constructor(region, name){
        this.region = region;
        this.name = name;
        this.id = undefined;
        this.profileIconId = undefined;
        this.mastery = undefined;
        this.leagues = undefined;
        this.createdAt = new Date();
    };
    
    static totalLeaguePoints(tier, rank, leaguePoints){
        const tiers = ['IRON','BRONZE','SILVER','GOLD','PLATINUM','DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
        const ranks = ['IV','III','II','I'];
        
        const tierPoints = tiers.indexOf(tier) * 400;
        const rankPoints = ranks.indexOf(rank) * 100;

        return tierPoints + rankPoints + leaguePoints;
    };

    static find({region, name}){
        if(!region || !name) return null;
        const players = Player.all;
        const player = players.get(`${region+name.trim().toLowerCase()}`);
        if(!player) return null;
        return player;    
    };
};

Player.all = new Map();

Player.prototype.syncSummonerInfo = async function(){
    try{
        const summonerInfo = await axios.get(api.sumByName(this.region, this.name), config);
        this.name = summonerInfo.data.name;
        this.id = summonerInfo.data.id;
        this.profileIconId = summonerInfo.data.profileIconId;
        if(!Player.all.get(`${this.region+this.name}`)){
            Player.all.set(`${this.region+this.name.trim().toLowerCase()}`, this);
        }; 
        return this;
    } catch (error){
        if(error.response){
            const status = error.response.status;
            if( status === 404){
                return {...apiErrors.get(404), name: this.name};
            } else {
                return apiErrors.get(error.response.status);
            };
        } else {
            return {error: error.toString()};
        };
    };
};

Player.prototype.syncLeagues = async function(){
    try{
        const leaguesData = await axios.get(api.leaguesById(this.region, this.id), config);
        this.leagues = {};
        leaguesData.data.forEach( league => { // Player.all Map contain a reference to this object so is also updated
            const { tier, rank, leaguePoints, queueType } = league;
            if(league.queueType === 'RANKED_SOLO_5x5') {
                this.leagues.solo = { tier, rank, leaguePoints };
                this.leagues.solo.totalLeaguePoints = Player.totalLeaguePoints( tier, rank, leaguePoints );
            };
        });
        return this;
    } catch (error){
        if(error.response){
            return apiErrors.get(error.response.status);
        } else {
            return {error: error.toString()};
        };
    };
};

Player.prototype.syncMastery = async function(){
    try{
        const masteryData = await axios.get(api.masteryById(this.region, this.id), config);
        this.mastery = masteryData.data;
        return this;
    } catch (error){
        if(error.response){
            return apiErrors.get(error.response.status);
        } else {
            return {error: error.toString()};
        };
    };
};

module.exports = Player;