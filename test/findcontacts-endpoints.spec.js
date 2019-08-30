const app = require('../src/app')
const helpers = require('./test-helpers')
const config = require('../src/config')

describe('Find Contacts Endpoints', function () {

    const testUsers = helpers.makeUsersArray()
    const validCreds = { username: testUsers[0].username, password: testUsers[0].password }

    const expectedContact = [{
        value: 'darrell@thinkful.com',
        type: 'personal',
        confidence: 98,
        first_name: 'Darrell',
        last_name: 'Dan',
        position: 'Software Engineering',
        seniority: 'executive',
        sources: [
            {
                "domain": "thinkful.com",
                "extracted_on": "2018-08-27",
                "last_seen_on": "2019-08-30",
                "still_on_page": true,
                "uri": "http://thinkful.com/blog/work-at-thinkful",
            },
            {
                "domain": "hackbrightacademy.com",
                "extracted_on": "2017-03-23",
                "last_seen_on": "2019-07-18",
                "still_on_page": true,
                "uri": "http://hackbrightacademy.com/coding-bootcamps-unveil-council-integrity-results-reporting"
            },
            {
                "domain": "thinkful.com",
                "extracted_on": "2017-06-30",
                "last_seen_on": "2017-06-30",
                "still_on_page": false,
                "uri": "http://thinkful.com/about/careers",
            },
            {
                "domain": "dev.stackstack.com",
                "extracted_on": "2017-04-27",
                "last_seen_on": "2017-09-14",
                "still_on_page": false,
                "uri": "http://dev.stackstack.com/thinkful"
            },
            {
                "domain": "thediylearner.com",
                "extracted_on": "2016-09-19",
                "last_seen_on": "2019-04-09",
                "still_on_page": false,
                "uri": "http://thediylearner.com/episode-04-with-darrell-silver-of-thinkful",
            },
            {
                "domain": "thinkful.com",
                "extracted_on": "2016-02-11",
                "last_seen_on": "2017-10-21",
                "still_on_page": false,
                "uri": "http://thinkful.com/bootcamp-jobs-stats",
            },
            {
                "domain": "blog.thinkful.com",
                "extracted_on": "2015-06-23",
                "last_seen_on": "2019-04-29",
                "still_on_page": false,
                "uri": "http://blog.thinkful.com/post/43542166875/work-at-thinkful",
            }
        ],
        department: 'executive',
        linkedin: null,
        twitter: null,
        phone_number: null
    }]

    const badSearch = { search: { domain: 'asdf.com', company: '', seniority: 'executive', department: '' } };
    const goodSearch = { search: { domain: 'thinkful.com', company: '', seniority: '', department: 'executive' } }
    const emptySearch = { search: {} };

    describe(`Getting contacts from /api/findcontacts`, () => {
        context(`Given no contacts`, () => {
            it(`responds with 200 and an a nested empty list`, () => {
                return supertest(app)
                    .post('/api/findcontacts')
                    .set('Authorization', helpers.makeAuthHeader(validCreds))
                    .send(badSearch)
                    .expect(res => {
                        expect(res.body.data.emails).to.eql([])
                    })
            })
        })

        context(`Given an empty search`, () => {
            it(`responds with a 400`, () => {
                return supertest(app)
                    .post('/api/findcontacts')
                    .set('Authorization', helpers.makeAuthHeader(validCreds))
                    .send(emptySearch)
                    .expect(400)
            })
        })

        context('Given there are contacts matching the search', () => {
            it('responds with 200 and all of the contacts', () => {
                return supertest(app)
                    .post('/api/findcontacts')
                    .set('Authorization', helpers.makeAuthHeader(validCreds))
                    .send(goodSearch)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.data.emails).to.eql(expectedContact)
                    })
            })
        })
    })
})
