const api = require('../../src/utils/riotAPI');

test(`Should return a region name if a region exist`, () => {
    expect(api.regions.get('la1')).toBe('LAN');
});
test(`Should return 'undefined' if an error doesn't exist`, () => {
    expect(api.regions.get('test')).toBe(undefined);
});