// Libraries
const qs = Qs;

// DOM Elements
const $inputs = document.querySelectorAll('form input');
const $matchBtn = document.querySelector('form button');
const $region = document.getElementById('region');
const $teamA = document.getElementById('team-a-players');
const $teamB = document.getElementById('team-b-players');
const $msg = document.getElementById('msg');

// Templates
const playerTemplate = document.getElementById('player').innerHTML;
const errorTemplate = document.getElementById('error').innerHTML;

// Populate UI from localStorage
const populateUI = () => {
    // Region select
    const selectedRegionIndex = localStorage.getItem('selectedRegionIndex');
    if(selectedRegionIndex){
        $region.selectedIndex = selectedRegionIndex;
    };
        
    // Summoner Names
};

populateUI();

// App Logic
const getSumNames = () => {
    const inputsArr = Array.from($inputs);
    return inputsArr.reduce( (players, input) => {
        if(!input.value) return players;
        players.push(input.value.trim());
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
    const profileIconId = player.profileIconId;
    const html = Mustache.render(playerTemplate, { name, tier, profileIconId });
    container.insertAdjacentHTML('beforeend', html);
};

const updateTeamsUI = teams =>{
    teams.teamA.forEach( player => renderPlayer($teamA, player));
    teams.teamB.forEach( player => renderPlayer($teamB, player));
};

const balance = async (region, sumNames) => {
    if(sumNames.length < 2) return {error: 'Please enter two or more summoner names'}
    const query = qs.stringify({ region, sumNames }, { addQueryPrefix: true });
    const matchData = await axios.get( '/match' + query );
    return matchData.data;    
};

const lockUI = () => {
    $region.setAttribute('disabled', 'disabled');
    $matchBtn.setAttribute('disabled', 'disabled');
    const inputsArr = Array.from($inputs);
    inputsArr.forEach( input => input.setAttribute('disabled', 'disabled'));
};

const unLockUI = () => {
    $region.removeAttribute('disabled');
    $matchBtn.removeAttribute('disabled');
    const inputsArr = Array.from($inputs);
    inputsArr.forEach( input => input.removeAttribute('disabled'));
};

const cleanElement =  element => {
    element.innerHTML = '';
};

const renderError = error =>{
    const html = Mustache.render(errorTemplate, {...error});
    cleanElement($msg);
    $msg.insertAdjacentHTML('beforeend', html);
};

// Match
$matchBtn.addEventListener('click', async e => {
    e.preventDefault();
    lockUI();
    const sumNames = getSumNames();
    const region = $region.value;
    const match = await balance(region, sumNames);
    if(match.error){
        renderError({error: match.error});
        return unLockUI();
    };
    cleanElement($msg);
    cleanElement($teamA);
    cleanElement($teamB);
    updateTeamsUI(match);
    unLockUI();
});

// Save select value on localStorage
$region.addEventListener('change', e => {
    const selectedRegionIndex = e.target.selectedIndex;
    localStorage.setItem('selectedRegionIndex', selectedRegionIndex);
});