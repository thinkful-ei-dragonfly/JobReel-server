const app = require('../src/app')
const helpers = require('./test-helpers')
const config = require('../src/config')
let { token } = require('../src/eventbrite/eventbrite-router')
var should = require('should');
var requestOne = require('supertest')('https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=I6MVEHHYVS3LD42Z46&redirect_uri=https://stormy-beyond-18995.herokuapp.com/api/eventbrite/access');
var requestTwo = require('supertest')(app);

const testUsers = helpers.makeUsersArray()
const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
const emptySearch = { category: { }};
const badCategorySearch = { category: {id: '2999' } };
const goodCategorySearch = { category: {id: '101' } };

describe('GET /api/events', function () {

    it('should redirect from the endpoint', function (done) {
        requestOne
            .get('/')
            .set('Accept', 'application/json')
            .expect(302, done);
    });

    describe(`Getting categories from /api/eventbrite/categoriesbyID`, () => {
        context(`Given no category matching id`, () => {
            it(`responds with 200 and an a nested empty list`, () => {
                return supertest(app)
                    .post('/api/eventbrite/categoriesbyID')
                    .set('Authorization', helpers.makeAuthHeader(validCreds))
                    .send(badCategorySearch)
                    .expect(res => {
                        res.body.should.be.instanceOf(Object)
                    })
            })
        })

        context(`Given an empty search`, () => {
            it(`responds with a 400`, () => {
                return supertest(app)
                    .post('/api/eventbrite/categoriesbyID')
                    .set('Authorization', helpers.makeAuthHeader(validCreds))
                    .send(emptySearch)
                    .expect(400)
            })
        })
    })

});



