const app = require('../src/app')
const helpers = require('./test-helpers')
const bcrypt = require('bcryptjs')

describe.only('Saved Contacts Endpoints', () => {
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
        it('responds with 200 and all of the contacts for a user', () => {
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

  describe(`POST /api/contacts`, () => {
    beforeEach('insert users', () => {
      return db
      .into('users')
      .insert(testUsers)
    })

    const requiredFields = ['job_title', 'company', 'contact_name']

    requiredFields.forEach((field) => {
      const contactBody = {
        job_title: 'Job1',
        company: 'Company1',
        contact_name: 'Contact1'
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

    it(`responds with 201 and returns the posted contact`, () => {
      const newContact = {
        job_title: 'Job3',
        company: 'Company3',
        contact_name: 'Contact3',
        email: 'email3@email.com',
        linkedin: 'http://www.linkedin.com/person',
        comments: 'Contact 3'
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
          expect(res.headers.location).to.eql(`/api/contacts/${res.body.contact_id}`)
          const expectedDate = new Date().toLocaleString();
          const actualDate = new Date(res.body.date_added).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
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
              const actualDate = new Date(res.body.date_added).toLocaleString();
              expect(actualDate).to.eql(expectedDate);
            })
      )
    })
  })
})