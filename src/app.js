const express = require('express');
const path = require('path');
const { regions } = require('./utils/riotAPI');
const { getPlayers } = require('./utils/playersHandler');
const { balance } = require('./utils/balancer');
const matchRouter = require('./routers/match');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(matchRouter);

app.get('/match_old', async (req, res, next) => {
    const region = req.query.region;
    const sumNames = req.query.sumNames;

    const players = await getPlayers(region, sumNames);
    if(players.error) return res.status(500).json({error: players.error});

    const match = balance(players);
    res.json(match);
});

module.exports = app;