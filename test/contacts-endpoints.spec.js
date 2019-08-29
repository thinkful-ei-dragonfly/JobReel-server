const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Saved Contacts Endpoints', () => {
  let db

  const testUsers = helpers.makeUsersArray()
  const [testUser] = testUsers
  const testContacts = helpers.makeContactsArray()
  const validCreds = { username: testUsers[0].username, password: testUsers[0].password }

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
      const testUsers = helpers.makeUsersArray()

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
        const invalidUser = { username: 'NonExistent', id: 1 }

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
        return supertest(app)
          .get(`/api/contacts`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, [])
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
      it('responds with 200 and all of the contacts for a user', () => {
        const userId = testUser.id
        const filteredTestContacts = testContacts.filter(contact => contact.user_id === userId)

        return supertest(app)
          .get(`/api/contacts`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, filteredTestContacts)
      })
    })
  })

  describe(`POST /api/contacts`, () => {
    beforeEach('insert users', () => {
      return db
        .into('users')
        .insert(testUsers)
    })

    const requiredFields = ['job_title', 'company', 'contact_name', 'connected']

    requiredFields.forEach((field) => {
      const contactBody = {
        job_title: 'Job1',
        company: 'Company1',
        contact_name: 'Contact1',
        connected: false,
      }

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete contactBody[field]

        return supertest(app)
          .post('/api/contacts')
          .send(contactBody)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })


    it(`responds with 400 and error message about invalid linkedin url`, () => {
      const invalidURL = {
        job_title: 'Job1',
        company: 'Company1',
        contact_name: 'Contact1',
        connected: false,
        linkedin: 'linkedin.com/person'
      }

      return supertest(app)
        .post('/api/contacts')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(invalidURL)
        .expect(400, {
          error: 'Not a valid linkedin URL'
        })
    })

    it(`responds with 400 and error message about invalid email`, () => {
      const invalidEmail = {
        job_title: 'Job1',
        company: 'Company 1',
        contact_name: 'Contact1',
        connected: false,
        email: 'badEmail'
      }

      return supertest(app)
      .post('/api/contacts')
      .set('Authorization', helpers.makeAuthHeader(testUser))
      .send(invalidEmail)
      .expect(400, {
        error: 'Not a valid email'
      })
    })

    it.only(`responds with 201 and returns the posted contact`, () => {
      const newContact = {
        job_title: 'Job3',
        company: 'Company3',
        contact_name: 'Contact3',
        email: 'email3@email.com',
        linkedin: 'http://www.linkedin.com/person',
        comments: 'Contact 3',
        connected: false
      }

      return supertest(app)
        .post('/api/contacts')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newContact)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('contact_id')
          expect(res.body).to.have.property('connected')
          expect(res.body).to.have.property('user_id')
          expect(res.body.job_title).to.eql(newContact.job_title)
          expect(res.body.contact_name).to.eql(newContact.contact_name)
          expect(res.body.company).to.eql(newContact.company)
          expect(res.body.email).to.eql(newContact.email)
          expect(res.body.linkedin).to.eql(newContact.linkedin)
          expect(res.body.comments).to.eql(newContact.comments)
          expect(res.body.connected).to.eql(newContact.connected)
          expect(res.headers.location).to.eql(`/api/contacts/${res.body.contact_id}`)
          const expectedDate = new Date().toLocaleString();
          const actualDateAdded = new Date(res.body.date_added).toLocaleString();
          expect(actualDateAdded).to.eql(expectedDate);
        })
        .expect(res =>
          db
            .from('contacts')
            .select('*')
            .where({ user_id: res.body.user_id })
            .first()
            .then(row => {
              expect(row.job_title).to.eql(newContact.job_title)
              expect(row.contact_name).to.eql(newContact.contact_name)
              expect(row.company).to.eql(newContact.company)
              expect(row.email).to.eql(newContact.email)
              expect(row.linkedin).to.eql(newContact.linkedin)
              expect(row.comments).to.eql(newContact.comments)
              const expectedDate = new Date().toLocaleString();
              const actualDateAdded = new Date(res.body.date_added).toLocaleString();
              const actualDateConnected = new Date(res.body.date_connected).toLocaleString();
              expect(actualDateAdded).to.eql(expectedDate);
              expect(actualDateConnected).to.eql(expectedDate);
            })
        )
    })
  })

  describe('GET /api/contacts/:contact_id', () => {

    context(`Given no contacts`, () => {

      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds 404 when the contact doesn't exist`, () => {
        return supertest(app)
          .get(`/api/contacts/123`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: `Contact doesn't exist`
          })
      })
    })

    context('Given there are contacts in the database', () => {

      beforeEach('insert contacts', () => {
        return helpers.seedContacts(db, testUsers, testContacts)
      })

      it('responds with 200 and the specified contact', () => {
        const contactId = 2
        const expectedContact = testContacts[contactId - 1]

        return supertest(app)
          .get(`/api/contacts/${contactId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, expectedContact)
      })
    })
  })

  describe(`DELETE /api/contacts/:contact_id`, () => {

    context('Given no contacts in databse', () => {
      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 404 when the contact doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/contacts/1`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: `Contact doesn't exist`
          })
      })
    })

    context('Given there are contacts in the database', () => {
      beforeEach('insert contacts', () => {
        return helpers.seedContacts(db, testUsers, testContacts)
      })

      it('responds with 204 and removes the contact', () => {
        const idToRemove = 2
        const expectedContacts = testContacts.filter(contact => contact.contact_id !== idToRemove)

        return supertest(app)
          .delete(`/api/contacts/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/contacts`)
              .set('Authorization', helpers.makeAuthHeader(validCreds))
              .expect(expectedContacts)
          )
      })
    })
  })

  describe(`PATCH /api/contacts/:contact_id`, () => {

    context('Given no contacts in the database', () => {

      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 404`, () => {
        const contactId = 1
        return supertest(app)
          .patch(`/api/contacts/${contactId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: `Contact doesn't exist`
          })
      })
    })

    context('Given there are contacts in the database', () => {

      beforeEach('insert contacts', () => {
        return helpers.seedContacts(db, testUsers, testContacts)
      })

      it('responds with 204 and updates the contact', () => {
        const idToUpdate = 2
        const updateContact = {
          contact_name: 'New Contact',
          job_title: 'New Title',
          company: 'New Company',
          email: 'new@email.com',
          linkedin: 'http://www.newsite.com/person1',
          comments: 'New Contact 1 comments',
          date_added: '2019-07-03T19:26:38.918Z',
          connected: true,
          user_id: 2
        }
        const expectedContact = {
          ...testContacts[idToUpdate - 1],
          ...updateContact
        }
        return supertest(app)
          .patch(`/api/contacts/${idToUpdate}`)
          .send(updateContact)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/contacts/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(validCreds))
              .expect(expectedContact)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/contacts/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: `Request body must contain either 'job_title', 'company', 'contact_name', 'email', 'linkedin', 'comments', or 'connected'`
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updatedContact = {
          job_title: 'New Job title'
        }
        const expectedContact = {
          ...testContacts[idToUpdate - 1],
          ...updatedContact
        }

        return supertest(app)
          .patch(`/api/contacts/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .send({
            ...updatedContact,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/contacts/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(validCreds))
              .expect(expectedContact)
          )
      })

      it(`responds with 400 when linkedin url is invalid`, () => {
        const idToUpdate = 2
        const updatedContact = {
          linkedin: 'www.linkedin.com'
        }
        return supertest(app)
        .patch(`/api/contacts/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send({
          ...updatedContact,
          fieldToIgnore: 'should not be in GET response'
        })
        .expect(400, {
          error: 'Not a valid linkedin URL'
        })
      })

      it(`responds with 400 when email is invalid`, () => {
        const idToUpdate = 2
        const updatedContact = {
          email: 'bad email'
        }
        return supertest(app)
        .patch(`/api/contacts/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send({
          ...updatedContact,
          fieldToIgnore: 'should not be in GET response'
        })
        .expect(400, {
          error: 'Not a valid email'
        })
      })
    })
  })
})