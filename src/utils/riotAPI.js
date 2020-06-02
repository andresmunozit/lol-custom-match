const api = {
    sumByName: (region, name) => `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}`,
    masteryById: (region, id) => `https://${region}.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${id}`,
    leaguesById: (region, id) => `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`,
};

const config = {
    headers: {'X-Riot-Token':`${process.env.RIOT_API}`}
};

const regions = new Map([
    ['br1', 'BR'],
    ['eun1', 'EUNE'],
    ['euw1', 'EUW'],
    ['jp1', 'JP'],
    ['kr', 'KR'],
    ['la1', 'LAN'],
    ['la2', 'LAS'],
    ['na1', 'NA'],
    ['oc1', 'OCE'],
    ['ru', 'RU'],
    ['tr1', 'TR'],
]);

const apiErrors = new Map([
    [400, {error: 'Bad request', code: 400}],
    [401, {error: 'Unauthorized', code: 401}],
    [403, {error: 'Forbidden', code: 403}],
    [404, {error: 'Not found', code: 404}],
    [415, {error: 'Unsuported Media Type', code: 415}],
    [429, {error: 'Rate Limit Exceed', code: 429}],
    [500, {error: 'Internal Server Error', code: 500}],
    [503, {error: 'Service unavailable', code: 503}],
]); 

module.exports = {api, config, apiErrors, regions};