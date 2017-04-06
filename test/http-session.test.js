const should = require('should');
const HttpSession = require('../http-session');

describe('Http Session', function() {
    it('GET', async function() {
        const sess = new HttpSession();
        const response = await sess.get('http://google.co.kr');
        response.body.length.should.be.above(0);
    });
})