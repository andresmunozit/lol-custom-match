const express = require('express');
const { getPlayers, getLeagues, getMastery } = require('../utils/playersHandler');
const { balance, allRanked, allMastery } = require('../utils/balancer')
const { validateMatchRequest } = require('../middleware/validateAPI');

const router = express.Router();

router.get('/match', validateMatchRequest, async (req, res, next) => {
    const {region, summonerNames} = req.query;
    let players;
    try{
        players = await getPlayers(region, summonerNames);
        if(players.error) return res.status(players.code).json({...players});
        if(allRanked(players)) return res.json(balance(players));

        players = await getLeagues(players);
        if(players.error) return res.status(players.code).json({...players});
        if(allMastery(players)) return res.json(balance(players));

        players = await getMastery(players);
        if(players.error) return res.status(players.code).json({...players});
        return res.json(balance(players));
    } catch (error){
        return res.status(500).send({error: 'Internal server error'});
    };
});

module.exports = router;