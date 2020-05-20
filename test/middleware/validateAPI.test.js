const app = require('../../src/app');
const request = require('supertest');

test( 'Should response with an error because no summoner names or region are provided', async () => {
    let response;
    response = await request(app)
        .get('/match').send().expect(400);
    expect(response.body.error).toBe('Please, provide a valid region and a list of summoner names');

    response = await request(app)
        .get('/match?region=la1').send().expect(400);
    expect(response.body.error).toBe('Please, provide a valid region and a list of summoner names');

    response = await request(app)
        .get('/match?summonerNames=["Test1","Test2"]').send().expect(400);
    expect(response.body.error).toBe('Please, provide a valid region and a list of summoner names');
});

test('Should response with an error because a region doesn\'t exist', async () => {
    let response;
    response = await request(app)
        .get('/match?region=la3&summonerNames=["Test1","Test2"]').send().expect(400);
    expect(response.body.error).toBe('Region "la3" doesn\'t exist');
});

test('Should response with an error because summonerNames is not an array', async () => {
    let response;
    response = await request(app)
        .get('/match?region=la1&summonerNames=Test').send().expect(400);
    expect(response.body.error).toBe('summonerNames should be an array');
});

test('Should response with an error because of the length of the summonerNames array', async () => {
    let response;

    response = await request(app)
        .get('/match?region=la1&summonerNames[]=Test').send().expect(400);
    expect(response.body.error)
        .toBe('You have to provide more than one and less than 10 summoner names, instead you have provided 1 summoner name(s)');

    response = await request(app)
        .get('/match?region=la1&summonerNames[]=Test1&summonerNames[]=Test2&summonerNames[]=Test3&summonerNames[]=Test4&summonerNames[]=Test5&summonerNames[]=Test6&summonerNames[]=Test7&summonerNames[]=Test8&summonerNames[]=Test9&summonerNames[]=Test10&summonerNames[]=Test11')
        .send()
        .expect(400);
    expect(response.body.error)
        .toBe('You have to provide more than one and less than 10 summoner names, instead you have provided 11 summoner name(s)');
});

test('Should response with an error because of the length of indivudual summoner names', async () => {
    let response;
    response = await request(app)
        .get('/match?region=la1&summonerNames[]=Test1&summonerNames[]=T2&summonerNames[]=Test3&summonerNames[]=Test4444444444444')
        .send()
        .expect(400);
    expect(response.body)
        .toEqual({
                error: 'The summoner names have to be minimum 3 and maximum 16 characters, the following names are incorrect: T2, Test4444444444444',
                names: ["T2","Test4444444444444"]
        });
});

test('Should response with an error because the request contain duplicated summoner names', async () => {
    let response;
    response = await request(app)
        .get('/match?region=la1&summonerNames[]=Test1&summonerNames[]=Test1&summonerNames[]=Test2&summonerNames[]=Test3&summonerNames[]=Test4&summonerNames[]=Test4')
        .send()
        .expect(400);
    expect(response.body)
        .toEqual({
            error: `The following names are repeated: Test4, Test1`,
            names: ['Test4', 'Test1']
        });
});