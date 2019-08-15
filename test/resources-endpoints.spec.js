const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Resources Enpoints', () => {
  let db

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  before('cleanup', () => db.raw('TRUNCATE  users, resources RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users, resources RESTART IDENTITY CASCADE'))

  describe.only(`GET /api/resources`, () => {

    context(`Given no authorization`, () => {
      const testResources = helpers.makeResourcesArray()
      const testUsers = helpers.makeUsersArray()

      beforeEach('insert resources', () => {
        return helpers.seedUsers(db, testUsers)
        .then(() => {
          return helpers.seedResources(db, testResources)
        })
      })

      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
        .get(`/api/resources`)
        .expect(401, {
          error: 'Missing bearer token'
        })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'

        return supertest(app)
        .get(`/api/resources`)
        .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })

      it(`responds 401 'Unauthorized request' when ivalid sub in payload`, () => {
        const invalidUser = { username: 'NonExistent', id: 1 }

        return supertest(app)
        .get(`/api/resources`)
        .set('Authorization', helpers.makeAuthHeader(invalidUser))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })
    })

    context('Given no resources', () => {
      const testUsers = helpers.makeUsersArray()
      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 200 and an empty list`, () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        
        return supertest(app)
        .get(`/api/resources`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(200, [])
      })
    })

    context(`Given there are resources in the database`, () => {
      const testResources = helpers.makeResourcesArray()
      const testUsers = helpers.makeUsersArray()

      beforeEach('insert resources', () => {
        return helpers.seedUsers(db, testUsers)
        .then(() => {
          return helpers.seedResources(db, testResources)
        })
      })

      it('responds with 200 and all of the resources for a user', () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        const userId = testUsers[0].id
        const filteredResources = testResources.filter(resource => resource.user_id === userId)

        return supertest(app)
        .get(`/api/resources`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(200, filteredResources)
      })
    })

    context(`Given an XSS attack`, () => {
      const testUsers = helpers.makeUsersArray()
      const { maliciousResource, expectedResource } = helpers.makeMaliciousResource()

      beforeEach('insert malicious resource', () => {
        return helpers.seedUsers(db, testUsers)
        .then(() => {
          return db
          .into('resources')
          .insert(maliciousResource)
        })
      })

      it('removes XSS attack content', () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }

        return supertest(app)
        .get(`/api/resources`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(200)
        .expect(res => {
          expect(res.body[0].title).to.eql(expectedResource.title)
          expect(res.body[0].description).to.eql(expectedResource.description)
        })
      })
    })
  })
})