const axios = require('axios');
const express = require('express');
const path = require('path');
const { getPlayers, balance, balanceByMastery } = require('./utils/balancer');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/match', async (req, res, next) => {
    const region = req.query.region;
    const sumNames = req.query.sumNames;

    const players = await getPlayers(region, sumNames);
    const balancedByMastery = balanceByMastery(players);
    // const match = balance(players);

    res.json(balancedByMastery);
});

const port = process.env.PORT;
app.listen( port, () => {
    console.log(`Application is running in port ${port}...`);
});