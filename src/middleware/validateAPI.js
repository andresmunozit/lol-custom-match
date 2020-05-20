const { regions } = require('../utils/riotAPI');

const checkNamesLength = names => {
    const minLength = 3;
    const maxLength = 16;
    const invalidNames = names.filter( name => (name.length < minLength || name.length > maxLength ));
    return invalidNames;
};

const checkRepeatedNames = names => {
    const lowerCaseNames = names.map(name => name.toLowerCase().trim());
        let repeatedNames = [];
    while(lowerCaseNames.length > 0){
        const name = lowerCaseNames.pop();
        const repeatedNameIndex = lowerCaseNames.indexOf(name);
        if(repeatedNameIndex > -1 && repeatedNames.indexOf(name) === -1){
            repeatedNames.push(names[repeatedNameIndex]);
        };
    };
    return repeatedNames;
};

const validateMatchRequest = (req, res, next) => {

    const region = req.query.region;
    const summonerNames = req.query.summonerNames;
    
    // Validate region and summoner names
    if(!region || !summonerNames){
        return res.status(400).json(
            {error:'Please, provide a valid region and a list of summoner names'}
        );
    };

    // Validate that a region exists    
    if(!regions.get(region)){
        return res.status(400).json(
            {error:`Region "${region}" doesn't exist`}
        );
    };

    // Validate that summonerNames is an array
    if(!Array.isArray(summonerNames)){
        return res.status(400).json(
            {error:'summonerNames should be an array'}
        );
    };

    // Validate summonerNames array length
    if(summonerNames.length < 2 || summonerNames.length > 10){
        return res.status(400).json(
            {error:`You have to provide more than one and less than 10 summoner names, instead you have provided ${summonerNames.length} summoner name(s)`}
        );
    };

    // Validate summonerNames individual length
    const wrongLengthNames = checkNamesLength(summonerNames);
    if(wrongLengthNames.length > 0){
        return res.status(400).json(
            {
                error:`The summoner names have to be minimum 3 and maximum 16 characters, the following names are incorrect: ${wrongLengthNames.join(', ')}`,
                names: wrongLengthNames
            }
        );
    };

    // Validate that summonerNames have not duplicated elements
    const repeatedNames = checkRepeatedNames(summonerNames);
    if(repeatedNames.length > 0){
        return res.status(400).json(
            {
                error: `The following names are repeated: ${repeatedNames.join(', ')}`,
                names: repeatedNames
            }
        );
    };

    next();
};

module.exports = { validateMatchRequest };