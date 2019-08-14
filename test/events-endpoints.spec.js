const app = require('../src/app')
const helpers = require('./test-helpers')

describe ('Events Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  before('cleanup', () => db.raw('TRUNCATE users, events RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users, events RESTART IDENTITY CASCADE'))

  describe(`GET /api/events/`, () => {

    context(`Given no authorization`, () => {
      const testEvents = helpers.makeEventsArray()
      const testUsers  = helpers.makeUsersArray()

      beforeEach('insert events', () => {
        return db
        .into('users')
        .insert(testUsers)
        .then(() => {
          return db
          .into('events')
          .insert(testEvents)
        })
      })

      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
        .get(`/api/events`)
        .expect(401, {
          error: 'Missing bearer token'
        })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secrete`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'

        return supertest(app)
        .get(`/api/events`)
        .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'NonExistent', id: 1}

        return supertest(app)
        .get(`/api/events`)
        .set('Authorization', helpers.makeAuthHeader(invalidUser))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })
    })

    context.only('Given no events', () => {
      const testUsers = helpers.makeUsersArray()
      beforeEach('insert users', () => {
        return db
        .into('users')
        .insert(testUsers)
      })

      it(`responds with 200 and an empty list`, () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password}
        return supertest(app)
        .get(`/api/events`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(200, [])
      })
    })
  })
})