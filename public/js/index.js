// Libraries
const qs = Qs;

// DOM Elements
const $inputs = document.querySelectorAll('form input');
const $matchBtn = document.querySelector('form button');
const $regionSel = document.getElementById('region');
const $teamA = document.getElementById('team-a');
const $teamB = document.getElementById('team-b');

// Templates
const playerTemplate = document.getElementById('player').innerHTML;

// Populate UI from localStorage
const populateUI = () => {
    // Region select
    const selectedRegionIndex = localStorage.getItem('selectedRegionIndex');
    if(selectedRegionIndex){
        $regionSel.selectedIndex = selectedRegionIndex;
    };
        
    // Summoner Names
};

populateUI();

// App Logic
const getSumNames = () => {
    const inputsArr = Array.from($inputs);
    return inputsArr.reduce( (players, input) => {
        if(!input.value) return players;
        players.push(input.value);
        return players;
    },[]);
};

const getTier = leagues => {
    let tier; 
    if(leagues.length !== 0){
        leagues.forEach( league => {
            if(league.queueType === 'RANKED_SOLO_5x5'){
                tier = league.tier;
            };
        });
        if(!tier) return 'UNRANKED';
        return tier;
    } else {
        return 'UNRANKED';
    };
};

const renderPlayer = (container, player) => {
    const name = player.name;
    const tier = getTier(player.leagues);
    const html = Mustache.render(playerTemplate, { name, tier });
    container.insertAdjacentHTML('beforeend', html);
};

const updateTeamsUI = teams =>{
    teams.teamA.forEach( player => renderPlayer($teamA, player));
    teams.teamB.forEach( player => renderPlayer($teamB, player));
};

const balance = async (region, sumNames) => {
    const query = qs.stringify({ region, sumNames }, { addQueryPrefix: true });
    const matchData = await axios.get( '/match' + query );
    return matchData.data;    
};

// Match
$matchBtn.addEventListener('click', async e => {
    e.preventDefault();
    const sumNames = getSumNames();
    const region = $regionSel.value;
    const match = await balance(region, sumNames);
    updateTeamsUI(match);
});

// Save select value on localStorage
$regionSel.addEventListener('change', e => {
    const selectedRegionIndex = e.target.selectedIndex;
    localStorage.setItem('selectedRegionIndex', selectedRegionIndex);
});