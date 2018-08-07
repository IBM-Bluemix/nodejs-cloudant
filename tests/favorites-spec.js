require('should');
const supertest = require('supertest');
const server = supertest.agent(require('../app.js'));

describe('FAVORITES APIs', function () {

    it('GET FAVORITES', function (done) {
        server
            .get('/api/favorites')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(201)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.body.should.be.empty();
                return done();
            });
    });

});
