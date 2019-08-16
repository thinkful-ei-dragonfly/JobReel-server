const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Resources Enpoints', () => {
  let db

  const testResources = helpers.makeResourcesArray()
  const testUsers = helpers.makeUsersArray()
  const validCreds = { username: testUsers[0].username, password: testUsers[0].password }

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  before('cleanup', () => db.raw('TRUNCATE  users, resources RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users, resources RESTART IDENTITY CASCADE'))

  describe(`GET /api/resources`, () => {

    context(`Given no authorization`, () => {


      beforeEach('insert resources', () => {
        return helpers.seedResources(db, testUsers, testResources)
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
      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 200 and an empty list`, () => {
        

        return supertest(app)
          .get(`/api/resources`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, [])
      })
    })

    context(`Given there are resources in the database`, () => {

      beforeEach('insert resources', () => {
        return helpers.seedResources(db, testUsers, testResources)
      })

      it('responds with 200 and all of the resources for a user', () => {
        const userId = testUsers[0].id
        const filteredResources = testResources.filter(resource => resource.user_id === userId)

        return supertest(app)
          .get(`/api/resources`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, filteredResources)
      })
    })

    context(`Given an XSS attack`, () => {
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

  describe(`POST /api/resources`, () => {
    beforeEach('insert users', () => {
      return helpers.seedUsers(db, testUsers)
    })

    const requiredFields =
      [
        'type',
        'title',
        'date_added',
      ]

    requiredFields.forEach(field => {
      const newResource = {
        type: 'website',
        title: 'Resource 1',
        description: 'Description for resource 1',
        date_added: '2019-07-03T19:26:38.918Z',
        user_id: 1
      }
      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newResource[field]

        return supertest(app)
          .post(`/api/resources`)
          .send(newResource)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(400, {
            error: `Missing '${field}' in request body`
          })
      })
    })

    it(`creates a resource, responding with 201 and the new resource`, () => {
      const newResource = {
        type: 'website',
        title: 'Resource 1',
        description: 'Description for resource 1',
        date_added: '2019-07-03T19:26:38.918Z',
        user_id: 1
      }

      return supertest(app)
        .post(`/api/resources`)
        .send(newResource)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(201)
        .expect(res => {
          expect(res.body.type).to.eql(newResource.type)
          expect(res.body.title).to.eql(newResource.title)
          expect(res.body.description).to.eql(newResource.description)
          expect(res.body.date_added).to.eql(newResource.date_added)
          expect(res.body.user_id).to.eql(newResource.user_id)
          expect(res.body).to.have.property('resource_id')
          expect(res.headers.location).to.eql(`/api/resources/${res.body.resource_id}`)
        })
    })
  })
})