const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Saved Jobs Endpoints', () => {
  let db

  const testUsers = helpers.makeUsersArray()
  const [testUser] = testUsers
  const testJobs = helpers.makeJobsArray()
  const validCreds = { username: testUser.username, password: testUser.password }

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/savedjobs`, () => {
    context(`Given no authorization`, () => {
      const testJobs = helpers.makeJobsArray()
      const testUsers = helpers.makeUsersArray()

      beforeEach('insert jobs', () =>
        helpers.seedJobs(
          db,
          testUsers,
          testJobs
        )
      )

      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
          .get(`/api/savedjobs`)
          .expect(401, {
            error: 'Missing bearer token'
          })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secrete`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'

        return supertest(app)
          .get(`/api/savedjobs`)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, {
            error: 'Unauthorized request'
          })
      })

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'NonExistent', id: 1 }

        return supertest(app)
          .get(`/api/savedjobs`)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, {
            error: 'Unauthorized request'
          })
      })
    })

    context(`Given there are no jobs in the db`, () => {
      const testUsers = helpers.makeUsersArray()
      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get(`/api/savedjobs`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, [])
      })
    })

    context(`Given there are jobs in the db`, () => {
      beforeEach('insert jobs', () =>
        helpers.seedJobs(
          db,
          testUsers,
          testJobs
        )
      )

      it('responds with 200 and all of the jobs for a user', () => {
        const userId = testUser.id
        const filteredTestJobs = testJobs.filter(job => job.user_id === userId)

        return supertest(app)
          .get(`/api/savedjobs`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, filteredTestJobs)
      })
    })
  })

  describe(`POST /api/savedjobs`, () => {
    beforeEach('insert users', () => {
      return helpers.seedUsers(db, testUsers)
    })

    const requiredFields = ['job_title', 'company', 'city', 'state', 'url',]

    requiredFields.forEach((field) => {
      const jobBody = {
        job_title: 'Engineer',
        company: 'Company A',
        city: 'New York City',
        state: 'NY',
        url: 'http://www.thinkful.com',
      }

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete jobBody[field]

        return supertest(app)
          .post('/api/savedjobs')
          .send(jobBody)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })


    it(`responds with 400 and error message about invalid url`, () => {
      const invalidURL = {
        job_title: 'UX Designer',
        company: 'Company C',
        city: 'Minneapolis',
        state: 'MN',
        url: 'www.facebook.com',
        description: 'UX job',
      }

      return supertest(app)
        .post('/api/savedjobs')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(invalidURL)
        .expect(400, {
          error: 'Not a valid URL'
        })
    })

    it(`responds with 400 and error message about invalid state code`, () => {
      const invalidState = {
        job_title: 'UX Designer',
        company: 'Company C',
        city: 'Minneapolis',
        state: 'M',
        url: 'http://www.facebook.com',
        description: 'UX job',
      }

      return supertest(app)
        .post('/api/savedjobs')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(invalidState)
        .expect(400, {
          error: 'Not a valid state code'
        })
    })

    it(`responds with 201 and returns the posted job`, () => {
      const newJob = {
        job_title: 'UX Designer',
        company: 'Company C',
        city: 'Minneapolis',
        state: 'MN',
        url: 'http://www.facebook.com',
        description: 'UX job',
      }

      return supertest(app)
        .post('/api/savedjobs')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newJob)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('job_id')
          expect(res.body).to.have.property('status')
          expect(res.body).to.have.property('user_id')
          expect(res.body.job_title).to.eql(newJob.job_title)
          expect(res.body.company).to.eql(newJob.company)
          expect(res.body.city).to.eql(newJob.city)
          expect(res.body.state).to.eql(newJob.state)
          expect(res.body.url).to.eql(newJob.url)
          expect(res.body.description).to.eql(newJob.description)
          expect(res.headers.location).to.eql(`/api/savedjobs/${res.body.job_id}`)
          const expectedDate = new Date().toLocaleString();
          const actualDate = new Date(res.body.date_added).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
        })
        .expect(res =>
          db
            .from('jobs')
            .select('*')
            .where({ user_id: res.body.user_id })
            .first()
            .then(row => {
              expect(row.job_title).to.eql(newJob.job_title)
              expect(row.company).to.eql(newJob.company)
              expect(row.city).to.eql(newJob.city)
              expect(row.state).to.eql(newJob.state)
              expect(row.url).to.eql(newJob.url)
              expect(row.description).to.eql(newJob.description)
              const expectedDate = new Date().toLocaleString();
              const actualDate = new Date(row.date_added).toLocaleString();
              expect(actualDate).to.eql(expectedDate);
            })
        )
    })
  })

  describe('GET /api/savedjobs/:job_id', () => {

    context(`Given no jobs`, () => {

      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds 404 when the job doesn't exist`, () => {
        return supertest(app)
          .get(`/api/savedjobs/123`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: `Job doesn't exist`
          })
      })
    })

    context('Given there are jobs in the database', () => {

      beforeEach('insert jobs', () => {
        return helpers.seedJobs(db, testUsers, testJobs)
      })

      it('responds with 200 and the specified job', () => {
        const jobId = 2
        const expectedJob = testJobs[jobId - 1]

        return supertest(app)
          .get(`/api/savedjobs/${jobId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, expectedJob)
      })
    })
  })

  describe(`DELETE /api/savedjobs/:job_id`, () => {
    context('Given no jobs', () => {
      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 404 when the job doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/savedjobs/${1}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: `Job doesn't exist`
          })
      })
    })

    context('Given there are jobs in the database', () => {
      beforeEach('insert jobs', () => {
        return helpers.seedJobs(db, testUsers, testJobs)
      })

      it('responds with 204 and removes the job', () => {
        const idToRemove = 2
        const expectedJobs = testJobs.filter(job => job.job_id !== idToRemove)

        return supertest(app)
          .delete(`/api/savedjobs/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/savedjobs`)
              .set('Authorization', helpers.makeAuthHeader(validCreds))
              .expect(expectedJobs))
      })
    })
  })

  describe(`PATCH /api/savedjobs/:job_id`, () => {
    context('Given no jobs', () => {

      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 404`, () => {
        const jobId = 1
        return supertest(app)
          .patch(`/api/savedjobs/${jobId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: `Job doesn't exist`
          })
      })
    })

    context('Given there are jobs in the database', () => {

      beforeEach('insert jobs', () => {
        return helpers.seedJobs(db, testUsers, testJobs)
      })

      it('responds with 204 and updates the job', () => {
        const idToUpdate = 2
        const updateJob = {
          user_id: 1,
          job_title: 'New Job',
          company: 'Company C',
          city: 'Boston',
          state: 'MA',
          date_added: '2019-08-14T17:18:19.306Z',
          url: 'http://www.facebook.com',
        }
        const expectedJob = {
          ...testJobs[idToUpdate - 1],
          ...updateJob
        }
        return supertest(app)
          .patch(`/api/savedjobs/${idToUpdate}`)
          .send(updateJob)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/savedjobs/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(validCreds))
              .expect(expectedJob)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
        .patch(`/api/savedjobs/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send({ irrelevantField: 'foo' })
        .expect(400, {
          error: `Request body must contain either 'job_title', 'company', 'city', 'state', 'date_added', 'url', or 'description'`
        })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updatedJob = {
          job_title: 'New Job title'
        }
        const expectedJob = {
          ...testJobs[idToUpdate - 1],
          ...updatedJob
        }

        return supertest(app)
        .patch(`/api/savedjobs/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send({
          ...updatedJob,
          fieldToIgnore: 'should not be in GET response'
        })
        .expect(204)
        .then(() => 
        supertest(app)
        .get(`/api/savedjobs/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(expectedJob)
        )
      })

      it(`responds with 400 and error message about invalid url`, () => {
        const idToUpdate = 2
        const invalidUrl = {
          url: 'www.invalid.com'
        }

        return supertest(app)
        .patch(`/api/savedjobs/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send(invalidUrl)
        .expect(400, {
          error: 'Not a valid URL'
        })
      })

      it(`responds with 400 and error message about invalid state code`, () => {
        const idToUpdate = 2
        const invalidState = {
          state: 'Unknown State',
        }

        return supertest(app)
        .patch(`/api/savedjobs/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send(invalidState)
        .expect(400, {
          error: 'Not a valid state code'
        })
      })
    })
  })
})