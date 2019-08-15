const app = require('../src/app')
const helpers = require('./test-helpers')
const bcrypt = require('bcryptjs')

describe.only('Saved Jobs Endpoints', () => {
  let db

  
  const testUsers = helpers.makeUsersArray()
  const [testUser] = testUsers
  const testContacts = helpers.makeContactsArray()

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/contacts`, () => {
    context(`Given no authorization`, () => {
      const testContacts = helpers.makeContactsArray()
      const testUsers  = helpers.makeUsersArray()

      beforeEach('Seed contacts', () =>
      helpers.seedContacts(
        db,
        testUsers,
        testContacts
      )
    )

      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
        .get(`/api/contacts`)
        .expect(401, {
          error: 'Missing bearer token'
        })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secrete`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'

        return supertest(app)
        .get(`/api/contacts`)
        .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'NonExistent', id: 1}

        return supertest(app)
        .get(`/api/contacts`)
        .set('Authorization', helpers.makeAuthHeader(invalidUser))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })
    })

    context(`Given there are no contacts in the db`, () => {
      const testUsers = helpers.makeUsersArray()
      beforeEach('insert users', () => {
        return db
        .into('users')
        .insert(testUsers)
      })

      it(`responds with 200 and an empty list`, () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        return supertest(app)
        .get(`/api/contacts`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(200, {contacts: []})
      })
    })

    context(`Given there are contacts in the db`, () => {
      beforeEach('insert contacts', () =>
      helpers.seedContacts(
        db,
        testUsers,
        testContacts
      )
    )
        it('responds with 200 and all of the events for a user', () => {
          const validCreds = { username: testUser.username, password: testUser.password }
          const userId = testUser.id
          const filteredTestContacts = testContacts.filter(contact => contact.user_id === userId)

          return supertest(app)
          .get(`/api/contacts`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, {contacts: filteredTestContacts})
        })
      })
  })

})