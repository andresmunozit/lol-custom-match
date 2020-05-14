const axios = require('axios');
const express = require('express');
const path = require('path');
const { players } = require('./utils/combinator');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));



const port = process.env.PORT;
app.listen( port, () => {
    console.log(`Application is running in port ${port}`);
});