const app = require('../src/app')
const helpers = require('./test-helpers')
const config = require ('../src/config')

describe('Jobs Endpoints', function () {

    const { expectedAuthenticJobs, expectedGitHubJobs } = helpers.makeJobsFixtures()

    describe(`Getting jobsfrom /api/jobs/authentic`, () => {
        context(`Given no jobs`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .post('/api/jobs/authentic')
                    .expect(500)
            })
        })


        context('Given there are authentic API jobs', () => {
            it('responds with 200 and all of the jobs', () => {
                app.post((req, res, next) => {
                    const jobTitle = 'Uniform Teeth'
                    const locaiton = 'San Francisco'
                    unirest.get(`https://authenticjobs.com/api/?api_key=${config.AUTHENTIC_JOBS_API_TOKEN}&method=aj.jobs.search&keywords=${jobTitle}&location=${location}&format=json`)
                        .end(function (result) {
                            if (result.error) throw new Error(result.error)
                            res.status(200).send(result.body);
                        })
                    return supertest(app)
                        .post('/api/jobs')
                        .expect(200, expectedAuthenticJobs)
                })
            })
        })
    })
    describe(`Getting jobs from /api/jobs/github`, () => {
        context(`Given no jobs`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .post('/api/jobs/github')
                    .send({ jobTitle: 'Nonsense1234', location: 'Nonsense1234' })
                    .expect(500)
            })
        })


        context('Given there are Github API jobs', () => {
            it('responds with 200 and all of the jobs', () => {
                app.post((req, res, next) => {
                    const jobTitle = 'Full-stack'
                    const locaiton = 'San Diego'
                    unirest.get(`https://jobs.github.com/positions.json?description=${jobTitle}&location=${location}`)
                        .end(function (result) {
                            if (result.error) throw new Error(result.error)
                            res.status(200).send(result.body);
                        })
                    return supertest(app)
                        .post('/api/jobs')
                        .expect(200, expectedGitHubJobs)
                })
            })
        })
    })
})