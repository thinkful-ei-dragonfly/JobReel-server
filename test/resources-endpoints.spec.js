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
  before('cleanup', () => db.raw('TRUNCATE users, resources RESTART IDENTITY CASCADE'))

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

  describe('GET /api/resources/:resource_id', () => {

    context(`Given no resources`, () => {

      beforeEach('inser users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds 404 when the resource doesn't exist`, () => {
        return supertest(app)
          .get(`/api/resources/123`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: `Resource doesn't exist`
          })
      })
    })

    context('Given there are resources in the database', () => {

      beforeEach('insert resources', () => {
        return helpers.seedResources(db, testUsers, testResources)
      })

      it('responds with 200 and the specified resource', () => {
        const resourceId = 2
        const expectedResource = testResources[resourceId - 1]

        return supertest(app)
          .get(`/api/resources/${resourceId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, expectedResource)
      })
    })
  })

  describe('DELETE /api/resources/:resource_id', () => {

    context('Given no resources', () => {
      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 404 when the resource doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/resources/1`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: `Resource doesn't exist`
          })
      })
    })

    context('Given there are resources in the database', () => {
      beforeEach('insert resources', () => {
        return helpers.seedResources(db, testUsers, testResources)
      })

      it('responds with 204 and removes the resource', () => {
        const idToRemove = 2
        const expectedResource = testResources.filter(resource => resource.resource_id !== idToRemove)

        return supertest(app)
          .delete(`/api/resources/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/resources`)
              .set('Authorization', helpers.makeAuthHeader(validCreds))
              .expect(expectedResource)
          )
      })
    })
  })

  describe(`PATCH /api/resources/:resource_id`, () => {
    context('Given no resources', () => {

      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 404`, () => {
        const resourceId = 1
        return supertest(app)
          .patch(`/api/resources/${resourceId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: `Resource doesn't exist`
          })
      })
    })

    context('Given there are resources in the database', () => {

      beforeEach('insert resources', () => {
        return helpers.seedResources(db, testUsers, testResources)
      })

      it('responds with 204 and updates the resource', () => {
        const idToUpdate = 2
        const updateResource = {
          type: 'website',
          title: 'New Resource',
          description: 'Description for New Resource',
          date_added: '2019-07-03T19:26:38.918Z',
          user_id: 2
        }
        const expectedResource = {
          ...testResources[idToUpdate - 1],
          ...updateResource
        }
        return supertest(app)
        .patch(`/api/resources/${idToUpdate}`)
        .send(updateResource)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(204)
        .then(() => 
          supertest(app)
          .get(`/api/resources/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(expectedResource)
        )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
        .patch(`/api/resources/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send({ irrelevantField: 'foo' })
        .expect(400, {
          error: `Request body must contain 'type', 'title', 'description' or 'date_added'`
        })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updatedResource = {
          title: 'New Resource'
        }
        const expectedResource = {
          ...testResources[idToUpdate - 1],
          ...updatedResource
        }

        return supertest(app)
        .patch(`/api/resources/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send({
          ...updatedResource,
          fieldToIgnore: 'should not be in GET response'
        })
        .expect(204)
        .then(() => 
        supertest(app)
        .get(`/api/resources/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(expectedResource)
        )
      })
    })
  })
})