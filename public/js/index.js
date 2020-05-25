// Libraries
const qs = Qs;

// DOM Elements
const $inputs = document.querySelectorAll('form input');
const $matchBtn = document.querySelector('form button');
const $region = document.getElementById('region');
const $teamA = document.getElementById('team-a-players');
const $teamB = document.getElementById('team-b-players');
const $msg = document.getElementById('msg');
const $friendsList = document.getElementById('friends-list');

// Templates
const playerTemplate = document.getElementById('player').innerHTML;
const errorTemplate = document.getElementById('error').innerHTML;
const friendTemplate = document.getElementById('friend').innerHTML;

// Friends data
const createFriendsData = () => {
    const friendsData = { br1: [], eun1: [], euw1: [], la1: [], la2: [], oceoc1: [],  tr1: [], jp1: [], kr: []};
    localStorage.setItem('friends', JSON.stringify(friendsData));
    return friendsData;
};

const getFriendsData = ( region ) => { // region is optional
    if(localStorage.getItem('friends')){
        const friendsData = JSON.parse(localStorage.getItem('friends'));
        if(!region) return friendsData;
        return friendsData[`${region}`];
    } else {
        const friendsData = createFriendsData();
        if(!region) return friendsData;
        return friendsData[`${region}`];
    };
};

const renderFriend = friend => {
    const html = Mustache.render(friendTemplate, { friend });
    $friendsList.insertAdjacentHTML('beforeend', html);
};

const updateFriendsUI = friends => {
    friends.forEach( friend => renderFriend(friend) );
};

// Populate UI from localStorage
const populateUI = () => {
    // Region select
    const selectedRegionIndex = localStorage.getItem('selectedRegionIndex');
    if(selectedRegionIndex){
        $region.selectedIndex = selectedRegionIndex;
    };
        
    // Friends
    const region = $region.value;
    const friendsByRegion = getFriendsData(region);
    updateFriendsUI(friendsByRegion);
};

populateUI();

// App Logic
const getsummonerNames = () => {
    const inputsArr = Array.from($inputs);
    return inputsArr.reduce( (players, input) => {
        if(!input.value) return players;
        players.push(input.value.trim());
        return players;
    },[]);
};

const renderPlayer = (container, player) => {
    const name = player.name;
    const tier = player.leagues.solo ? player.leagues.solo.tier : 'UNRANKED';
    const profileIconId = player.profileIconId;
    const html = Mustache.render(playerTemplate, { name, tier, profileIconId });
    container.insertAdjacentHTML('beforeend', html);
};

const updateTeamsUI = teams =>{
    teams.teamA.forEach( player => renderPlayer($teamA, player));
    teams.teamB.forEach( player => renderPlayer($teamB, player));
};

const balance = async (region, summonerNames) => {
    if(summonerNames.length < 2) return {error: 'Please enter two or more summoner names'}
    const query = qs.stringify({ region, summonerNames }, { addQueryPrefix: true });
    try{
        const matchData = await axios.get( '/match' + query );
        return matchData.data;
    }catch(error){
        if(error.response){
            return {...error.response.data};
        };
    };
};

const lockUI = () => {
    $matchBtn.setAttribute('disabled', 'disabled');
    $matchBtn.textContent  = 'Matching...';
};

const unLockUI = () => {
    $matchBtn.removeAttribute('disabled');
    $matchBtn.textContent  = 'Match';
};

const cleanElement =  element => {
    element.innerHTML = '';
};

const renderError = error =>{
    const html = Mustache.render(errorTemplate, {...error});
    cleanElement($msg);
    $msg.insertAdjacentHTML('beforeend', html);
};

const showErrorInputs = names => {
    const inputs = Array.from($inputs);
    console.log('INPUTS',inputs);
    const errorInputs = inputs.filter( input => names.includes(input.value) );
    errorInputs.forEach( input => input.classList.add('error-input'));
};

const cleanErrorInputs = () => {
    $inputs.forEach( input => input.classList.remove('error-input'));    
};

/////////////
const saveFriendsData = friendsData => {
    localStorage.setItem('friends', JSON.stringify(friendsData));
};

const updateFriendsData = (friends, region) => {
    const friendsData = getFriendsData();

    const friendsByRegion = friendsData[`${region}`];
    let updatedFriendsByRegion;

    if(friendsByRegion.length === 0){
        updatedFriendsByRegion = friends;
    } else{
        console.log('FRIENDS BY REGION', friendsByRegion);
        const newFriends = friends.filter( friend => !friendsByRegion.includes(friend));
        console.log('NEW FRIENDS', newFriends);
        updatedFriendsByRegion = [...friendsByRegion, ...newFriends];
    };
    friendsData[`${region}`] = updatedFriendsByRegion.sort();

    saveFriendsData(friendsData);
};

const friendsFromMatch = match => {
    if(!match.teamA || !match.teamB) return [];
    const players = [...match.teamA, ...match.teamB];
    return players.map(player => player.name);
};



// Match
$matchBtn.addEventListener('click', async e => {
    e.preventDefault();
    lockUI();
    cleanErrorInputs();
    const summonerNames = getsummonerNames();
    const region = $region.value;
    const match = await balance(region, summonerNames);
    if(match.error){
        renderError({error: match.error});
        console.log(match);
        if(match.names) showErrorInputs(match.names);
        return unLockUI();
    };

    cleanElement($msg);
    cleanElement($teamA);
    cleanElement($teamB);
    updateTeamsUI(match);

    updateFriendsData(friendsFromMatch(match), region);
    cleanElement($friendsList);
    updateFriendsUI(getFriendsData(region));

    unLockUI();
});



// Save select value on localStorage
$region.addEventListener('change', e => {
    const selectedRegionIndex = e.target.selectedIndex;
    localStorage.setItem('selectedRegionIndex', selectedRegionIndex);

    const region = $region.value;
    const regionFriends = getFriendsData(region);
    cleanElement($friendsList);
    updateFriendsUI(regionFriends);
});