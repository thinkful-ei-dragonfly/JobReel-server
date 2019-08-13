const app = require('../src/app')
const helpers = require('./test-helpers')
const bcrypt = require('bcryptjs')

describe('User Endpoints', () => {
  let db

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
      const testUsers = helpers.makeUsersArray()
      const testUser = testUsers[0]

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
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
})