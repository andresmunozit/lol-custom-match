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
const $form = document.querySelector('form');

// Templates
const playerTemplate = document.getElementById('player').innerHTML;
const errorTemplate = document.getElementById('error').innerHTML;
const friendTemplate = document.getElementById('friend').innerHTML;

// Friends data
const createFriendsData = () => {
    const friendsData = { br1: [], eun1: [], euw1: [], jp1: [], kr: [], la1: [], la2: [], na1: [], oc1: [], ru: [], tr1: [] };
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
        const newFriends = friends.filter( friend => !friendsByRegion.includes(friend));
        updatedFriendsByRegion = [...friendsByRegion, ...newFriends];
    };
    friendsData[`${region}`] = updatedFriendsByRegion.sort( (a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    saveFriendsData(friendsData);
};

const friendsFromMatch = match => {
    if(!match.teamA || !match.teamB) return [];
    const players = [...match.teamA, ...match.teamB];
    return players.map(player => player.name.trim());
};

const toggleSelected = el => {
    const classList = Array.from(el.classList);
    classList.includes('selected') ? el.classList.remove('selected') : el.classList.add('selected');
    return Array.from(el.classList).includes('selected');
};

const getFriendsFromInputs = () => {
    return Array.from($inputs).filter(input => input.value ).map( input => input.value);
};

const isFriendOnIputs = friend => {
    const inputFriends = getFriendsFromInputs();
    const inputFriendsLowerCase = inputFriends.map(friend => friend.toLowerCase());
    return inputFriendsLowerCase.includes(friend.toLowerCase());
};

const getEmtpyInput = () => {
    const inputs = Array.from($inputs);
    return inputs.find( input => input.value === '');
};

const addFriendToInputs = friend => {
    const emptyInput = getEmtpyInput();
    emptyInput.value = friend;
};

const removeFriendFromInputs = friend => {
    const inputs = Array.from($inputs);
    const friendInputs = inputs.filter(input => input.value.toLowerCase() === friend.toLowerCase()) // Inputs where the friend is
    friendInputs.forEach( input => input.value = '');
};

const selectFriendsFromInputs = () => {
    const inputFriendsLowerCase = getFriendsFromInputs().map( friend => friend.toLowerCase());
    const $friends = document.querySelectorAll('.friend'); // Need to be called from here because at the start of the script no .friend elements are present
    const friends = Array.from($friends); // Elements
    friends.forEach( friend => {
        const friendInput = friend.innerText.toLowerCase();
        if (inputFriendsLowerCase.includes(friendInput)){
            friend.classList.add('selected');
        } else {
            friend.classList.remove('selected');
        };
    });
};

// Save select value on localStorage
$region.addEventListener('change', e => {
    const selectedRegionIndex = e.target.selectedIndex;
    localStorage.setItem('selectedRegionIndex', selectedRegionIndex);

    const region = $region.value;
    const regionFriends = getFriendsData(region);
    cleanElement($friendsList);
    updateFriendsUI(regionFriends);
});

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
    selectFriendsFromInputs();

    unLockUI();
});

// Select a friend an insert it if it doesnt is in the input list
$friendsList.addEventListener('click', e => {
    if(!Array.from(e.target.classList).includes('friend')) return;

    const $friend = e.target; // span element
    const friend = e.target.innerHTML; // value
    
    const selected = toggleSelected($friend); // Toggles selected class and return if is selected

    if(selected){
        if(!isFriendOnIputs(friend)) addFriendToInputs(friend);
    } else {
        if(isFriendOnIputs(friend)) removeFriendFromInputs(friend);
    };
});

// Un select based on input event
$form.addEventListener('input', (e) => {
    selectFriendsFromInputs();
});