const app = require('../src/app')
const helpers = require('./test-helpers')
const bcrypt = require('bcryptjs')

describe.only('Saved Jobs Endpoints', () => {
  let db

  const testUsers = helpers.makeUsersArray()
  const [testUser] = testUsers
  const testJobs = helpers.makeJobsArray()

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/jobs`, () => {
    context(`Given no authorization`, () => {
      const testJobs = helpers.makeJobsArray()
      const testUsers  = helpers.makeUsersArray()

      beforeEach('Seed jobs', () =>
      helpers.seedJobs(
        db,
        testUsers,
        testJobs
      )
    )

      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
        .get(`/api/jobs`)
        .expect(401, {
          error: 'Missing bearer token'
        })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secrete`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'

        return supertest(app)
        .get(`/api/jobs`)
        .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'NonExistent', id: 1}

        return supertest(app)
        .get(`/api/jobs`)
        .set('Authorization', helpers.makeAuthHeader(invalidUser))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })
    })

    context(`Given there are no jobs in the db`, () => {
      const testUsers = helpers.makeUsersArray()
      beforeEach('insert users', () => {
        return db
        .into('users')
        .insert(testUsers)
      })

      it(`responds with 200 and an empty list`, () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        return supertest(app)
        .get(`/api/jobs`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(200, {jobs: []})
      })
    })

    context(`Given there are jobs in the db`, () => {
      beforeEach('Seed jobs', () =>
      helpers.seedJobs(
        db,
        testUsers,
        testJobs
      )
    )
      it(`responds with 200 and returns an array of jobs`, () => {
        const expectedJobs = testJobs.map(job => 
          helpers.makeExpectedJob(
            testUsers,
            job
          ));

        return supertest(app)
        .get('/api/jobs')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, {jobs: expectedJobs})
        })
      })
    })
  describe.skip(`POST /api/jobs`, () => {
    beforeEach('Seed jobs', () =>
      helpers.seedJobs(
        db,
        testUsers,
        testJobs
      )
    )
    it(`responds with 201 and returns the posted job`, () => {
      const newJob = {
        job_id: 100,
        job_title: 'UX Designer',
        company: 'Company C',
        city: 'Minneapolis',
        state: 'MN',
        url: 'http://www.facebook.com',
        description: 'UX job',
      }

      return supertest(app)
        .post('/api/jobs')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newJob)
        .expect(201)
    })
    
  })
  })