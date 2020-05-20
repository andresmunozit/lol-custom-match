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

module.exports = app;