const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Saved Companies Endpoints', () => {
  let db

  const testUsers = helpers.makeUsersArray()
  const [testUser] = testUsers
  const testCompanies = helpers.makeCompaniesArray()

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/companies`, () => {
    context(`Given no authorization`, () => {

      beforeEach('insert companies', () =>
      helpers.seedCompanies(
        db,
        testUsers,
        testCompanies
      )
    )

      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
        .get(`/api/companies`)
        .expect(401, {
          error: 'Missing bearer token'
        })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secrete`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'

        return supertest(app)
        .get(`/api/companies`)
        .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'NonExistent', id: 1}

        return supertest(app)
        .get(`/api/companies`)
        .set('Authorization', helpers.makeAuthHeader(invalidUser))
        .expect(401, {
          error: 'Unauthorized request'
        })
      })
    })

    context(`Given there are no companies in the db`, () => {
      const testUsers = helpers.makeUsersArray()
      beforeEach('insert users', () => {
        return db
        .into('users')
        .insert(testUsers)
      })

      it(`responds with 200 and an empty list`, () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        return supertest(app)
        .get(`/api/companies`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(200, {companies: []})
      })
    })

    context(`Given there are companies in the db`, () => {
      beforeEach('insert companies', () =>
      helpers.seedCompanies(
        db,
        testUsers,
        testCompanies
      )
    )
    
        it('responds with 200 and all of the companies for a user', () => {
          const validCreds = { username: testUser.username, password: testUser.password }
          const userId = testUser.id
          const filteredTestCompanies = testCompanies.filter(company => company.user_id === userId)
         
          return supertest(app)
          .get(`/api/companies`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, {companies: filteredTestCompanies})
        })
      })
  })

  describe(`POST /api/companies`, () => {
    beforeEach('insert users', () => {
      return db
      .into('users')
      .insert(testUsers)
    })

    const requiredFields = ['company_name', 'city', 'state']

    requiredFields.forEach((field) => {
      const companyBody = {
        company_name: 'Company 1',
        city: 'City1',
        state: 'MD'
      }

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete companyBody[field]

        return supertest(app)
          .post('/api/companies')
          .send(companyBody)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })


    it(`responds with 400 and error message about state code`, () => {
      const invalidState = {
        company_name: 'Company1',
        city: 'City1',
        state: 'M'
      }

      return supertest(app)
      .post('/api/companies')
      .set('Authorization', helpers.makeAuthHeader(testUser))
      .send(invalidState)
      .expect(400, {
        error: 'Not a valid state code'
      })
    })

    it(`responds with 400 and error message about invalid website`, () => {
      const invalidURL = {
        company_name: 'Company1',
        city: 'City1',
        state: 'IL',
        website: 'www.companywebsite.com'
      }

      return supertest(app)
      .post('/api/companies')
      .set('Authorization', helpers.makeAuthHeader(testUser))
      .send(invalidURL)
      .expect(400, {
        error: 'Not a valid URL'
      })
    })

    it(`responds with 201 and returns the posted contact`, () => {
      const newCompany = {
        company_name: 'Company 3',
        city: 'City 3',
        state: 'IL',
        website: 'http://www.companywebsite.com',
        industry: 'Tech',
        description: 'Description',
        contact: 'Contact 3'
      }

      return supertest(app)
        .post('/api/companies')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newCompany)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('company_id')
          expect(res.body).to.have.property('user_id')
          expect(res.body.company_name).to.eql(newCompany.company_name)
          expect(res.body.city).to.eql(newCompany.city)
          expect(res.body.state).to.eql(newCompany.state)
          expect(res.body.industry).to.eql(newCompany.industry)
          expect(res.body.website).to.eql(newCompany.website)
          expect(res.body.description).to.eql(newCompany.description)
          expect(res.headers.location).to.eql(`/api/companies/${res.body.company_id}`)
          const expectedDate = new Date().toLocaleString();
          const actualDate = new Date(res.body.date_added).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
        })
        .expect(res =>
          db
            .from('companies')
            .select('*')
            .where({ user_id: res.body.user_id })
            .first()
            .then(row => {
              expect(row.company_name).to.eql(newCompany.company_name)
              expect(row.city).to.eql(newCompany.city)
              expect(row.state).to.eql(newCompany.state)
              expect(row.industry).to.eql(newCompany.industry)
              expect(row.website).to.eql(newCompany.website)
              expect(row.description).to.eql(newCompany.description)
              expect(row.contact).to.eql(newCompany.contact)
              const expectedDate = new Date().toLocaleString();
              const actualDate = new Date(row.date_added).toLocaleString();
              expect(actualDate).to.eql(expectedDate);
            })
      )
    })
  })

})