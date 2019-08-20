const app = require('../src/app')
const helpers = require('./test-helpers')
const bcrypt = require('bcryptjs')

describe('User Endpoints', () => {
  let db

  const testUsers = helpers.makeUsersArray()
  const expectedUsers = helpers.expectedUsers()
  const testUser = testUsers[0]
  const validCreds = { username: testUser.username, password: testUser.password }

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  before('cleanup', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'))

  describe(`POST /api/users`, () => {
    it(`creates a user, responding with 201 and the new user, stores bcrypted password`, () => {
      const newUser = {
        email: 'johndoe@gmail.com',
        first_name: 'John',
        last_name: 'Doe',
        username: 'JohnDoe',
        password: 'Password1!'
      }
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body.email).to.eql(newUser.email)
          expect(res.body.first_name).to.eql(newUser.first_name)
          expect(res.body.last_name).to.eql(newUser.last_name)
          expect(res.body.username).to.eql(newUser.username)
          expect(res.body).to.not.have.property('password')
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
        })
        .expect(res =>
          db
            .from('users')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.email).to.eql(newUser.email)
              expect(row.first_name).to.eql(newUser.first_name)
              expect(row.last_name).to.eql(newUser.last_name)
              expect(row.username).to.eql(newUser.username)

              return bcrypt.compare(newUser.password, row.password)
            })
            .then(compareMatch => {
              expect(compareMatch).to.be.true
            })
        )
    })

    const requiredFields = ['email', 'first_name', 'last_name', 'username', 'password']

    requiredFields.forEach(field => {
      const newUser = {
        email: 'johndoe@gmail.com',
        first_name: 'John',
        last_name: 'Doe',
        username: 'JohnDoe',
        password: 'Password1!'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field]

        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(400, {
            error: `Missing '${field}' in request body`

          })
      })
    })

    it(`responds 400 'Password must be longer than 7 characters' when given a short password`, () => {
      const userShortPassword = {
        email: 'user1@email.com',
        first_name: 'First',
        last_name: 'Last',
        username: 'User1',
        password: 'Pass1!'
      }
      return supertest(app)
        .post('/api/users')
        .send(userShortPassword)
        .expect(400, {
          error: `Password must be longer than 8 characters`
        })
    })

    it(`responds 400 'Password must be less than 72 characters' when given a long password`, () => {
      const userLongPassword = {
        email: 'email@email.com',
        first_name: 'First',
        last_name: 'Last',
        username: 'username',
        password: '*'.repeat(73)
      }
      return supertest(app)
        .post('/api/users')
        .send(userLongPassword)
        .expect(400, {
          error: `Password must be less than 72 characters`
        })
    })

    it(`responds 400 when password starts with spaces`, () => {
      const userPasswordStartsSpaces = {
        email: 'email@email.com',
        first_name: 'First',
        last_name: 'Last',
        username: 'username',
        password: ' Password1!'
      }
      return supertest(app)
        .post('/api/users')
        .send(userPasswordStartsSpaces)
        .expect(400, {
          error: 'Password must not start or end with empty spaces'
        })
    })

    it(`responds 400 when password ends with spaces`, () => {
      const userPasswordEndsSpaces = {
        email: 'email@email.com',
        first_name: 'First',
        last_name: 'Last',
        username: 'username',
        password: 'Password1! '
      }
      return supertest(app)
        .post('/api/users')
        .send(userPasswordEndsSpaces)
        .expect(400, {
          error: 'Password must not start or end with empty spaces'
        })
    })

    it(`responds 400 when password isn't complex enough`, () => {
      const UserPasswordNotComplex = {
        email: 'email@email.com',
        first_name: 'First',
        last_name: 'Last',
        username: 'username',
        password: 'password'
      }
      return supertest(app)
        .post('/api/users')
        .send(UserPasswordNotComplex)
        .expect(400, {
          error: 'Password must contain one upper case, lower case, number and special character'
        })
    })

    context('Given users already in the database', () => {


      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds 400 'An account with this email already exists' when email isn't unique`, () => {
        const duplicateEmail = {
          email: testUser.email,
          first_name: 'First',
          last_name: 'Last',
          username: 'username',
          password: 'Password1!'
        }
        return supertest(app)
          .post('/api/users')
          .send(duplicateEmail)
          .expect(400, {
            error: 'Email already taken'
          })
      })
    })

    it('removes XSS attack content from response', () => {
      const { maliciousUser, expectedUser } = helpers.makeMaliciousUser()
      return supertest(app)
        .post(`/api/users`)
        .send(maliciousUser)
        .expect(201)
        .expect(res => {
          expect(res.body.email).to.eql(expectedUser.email)
          expect(res.body.first_name).to.eql(expectedUser.first_name)
          expect(res.body.last_name).to.eql(expectedUser.last_name)
          expect(res.body.username).to.eql(expectedUser.username)
        })
    })
  })

  describe(`GET /api/users/:id`, () => {

    context(`Given no users`, () => {

      it(`responds with 404 and 'Missing bearer token'`, () => {
        const userId = 123456
        return supertest(app)
          .get(`/api/users/${userId}`)
          .expect(401, {
            error: `Missing bearer token`
          })
      })
    })

    context('Given there are users in the database', () => {

      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 401 'Unauthorized request' when id param is not the same as the users id`, () => {
        const userId = 2
        return supertest(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(401, {
            error: `Unauthorized request`
          })
      })

      it('responds with 200 and the specified user when id param is the same as the users id', () => {
        const userId = 1
        const expectedUser = expectedUsers[userId - 1]
        return supertest(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, expectedUser)
      })
    })

    context(`Given an XSS attack User`, () => {
      const { maliciousUser } = helpers.makeMaliciousUser()

      beforeEach('insert malicious user', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('users')
              .insert(maliciousUser)
          })
      })

      it('removes XSS attack content', () => {
        const userCreds = { username: maliciousUser.username, password: maliciousUser.password }
        return supertest(app)
          .get(`/api/users/${maliciousUser.id}`)
          .set('Authorization', helpers.makeAuthHeader(userCreds))
          .expect(200)
          .expect(res => {
            expect(res.body.email).to.eql(`email@email.com <img src="https://url.to.file.which/does-not.exist">`)
            expect(res.body.first_name).to.eql(`First <img src="https://url.to.file.which/does-not.exist">`)
            expect(res.body.last_name).to.eql(`Last <img src="https://url.to.file.which/does-not.exist">`)
            expect(res.body.username).to.eql(`username <img src="https://url.to.file.which/does-not.exist">`)
          })
      })
    })
  })

  describe(`DELETE /api/users/:id`, () => {

    context('Given no users', () => {

      it(`responds with 404 and 'Missing bearer token'`, () => {
        const userId = 123456
        return supertest(app)
          .get(`/api/users/${userId}`)
          .expect(401, {
            error: `Missing bearer token`
          })
      })
    })

    context('Given there are users in the database', () => {
      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 401 'Unauthorized request' when id param is not the same as the users id`, () => {
        const idToRemove = 2
        return supertest(app)
          .delete(`/api/users/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(401, {
            error: `Unauthorized request`
          })
      })
  
      it(`responds with 204 and removes the user when id param is the same as the user id`, () => {
        const idToRemove = 1
        return supertest(app)
        .delete(`/api/users/${idToRemove}`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(204)
      })
    })
  })
})