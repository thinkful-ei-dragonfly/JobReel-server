const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Events Endpoints', () => {
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
      const testUsers = helpers.makeUsersArray()

      beforeEach('insert events', () => {
        return helpers.seedEvents(db, testUsers, testEvents)
      })

      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
          .get(`/api/events`)
          .expect(401, {
            error: 'Missing bearer token'
          })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
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
        const invalidUser = { username: 'NonExistent', id: 1 }

        return supertest(app)
          .get(`/api/events`)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, {
            error: 'Unauthorized request'
          })
      })
    })

    context('Given no events', () => {
      const testUsers = helpers.makeUsersArray()
      beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers)
      })

      it(`responds with 200 and an empty list`, () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        
        return supertest(app)
          .get(`/api/events`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, [])
      })
    })

    context(`Given there are events in the database`, () => {
      const testEvents = helpers.makeEventsArray()
      const testUsers = helpers.makeUsersArray()

      beforeEach('insert events', () => {
        return helpers.seedEvents(db, testUsers, testEvents)
      })

      it('responds with 200 and all of the events for a user', () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        const userId = testUsers[0].id
        const filteredTestEvents = testEvents.filter(event => event.user_id === userId)
        return supertest(app)
          .get(`/api/events`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, filteredTestEvents)
      })
    })

    context(`Given an XSS attack Event`, () => {
      const testUsers = helpers.makeUsersArray()
      const { maliciousEvent, expectedEvent } = helpers.makeMaliciousEvent()

      beforeEach('insert malicious event', () => {
        return helpers.seedUsers(db, testUsers)
        .then(() => {
          return db
          .into('events')
          .insert(maliciousEvent)
        })
      })

      it('removes XSS attack content', () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        return supertest(app)
        .get(`/api/events`)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(200)
        .expect(res => {
          expect(res.body[0].event_name).to.eql(expectedEvent.event_name)
          expect(res.body[0].host).to.eql(expectedEvent.host)
          expect(res.body[0].city).to.eql(expectedEvent.city)
          expect(res.body[0].state).to.eql(expectedEvent.state)
          expect(res.body[0].address).to.eql(expectedEvent.address)
          expect(res.body[0].description).to.eql(expectedEvent.description)
          expect(res.body[0].status).to.eql(expectedEvent.status)
        })
      })
    })
  })

  describe(`POST /api/events`, () => {
    const testUsers = helpers.makeUsersArray()

    beforeEach('insert users', () => {
      return helpers.seedUsers(db, testUsers)
    })

    const requiredFields =
      [
        'event_name',
        'host',
        'city',
        'state',
        'address',
        'date',
        'url',
        'description',
        'status',
        'user_id'
      ]

    requiredFields.forEach(field => {
      const newEvent = {
        event_name: 'New Event',
        host: 'Host 1',
        city: 'Normal',
        state: 'IL',
        address: 'Address 1',
        date: '2019-07-03T19:26:38.918Z',
        url: 'http://www.event1.com',
        description: 'Description for New Event',
        status: 'Will Attend',
        user_id: 1
      }
      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        delete newEvent[field]

        return supertest(app)
          .post(`/api/events`)
          .send(newEvent)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(400, {
            error: `Missing '${field}' in request body`
          })
      })
    })

    it(`responds with 400 and error message about invalid url`, () => {
      const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
      const invalidUrl = {
        event_name: 'New Event',
        host: 'Host 1',
        city: 'Normal',
        state: 'IL',
        address: 'Address 1',
        date: '2019-07-03T19:26:38.918Z',
        url: 'www.invalid.com',
        description: 'Description for New Event',
        status: 'Will Attend',
        user_id: 1
      }

      return supertest(app)
        .post('/api/events')
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send(invalidUrl)
        .expect(400, {
          error: 'Not a valid URL'
        })
    })

    it(`responds with 400 and error message about invalid state code`, () => {
      const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
      const invalidState = {
        event_name: 'New Event',
        host: 'Host 1',
        city: 'Normal',
        state: 'Unknown State',
        address: 'Address 1',
        date: '2019-07-03T19:26:38.918Z',
        url: 'http://www.invalid.com',
        description: 'Description for New Event',
        status: 'Will Attend',
        user_id: 1
      }

      return supertest(app)
        .post('/api/events')
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .send(invalidState)
        .expect(400, {
          error: 'Not a valid state code'
        })
    })

    it(`creates an event, responding with 201 and the new event`, () => {
      const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
      const newEvent = {
        event_name: 'New Event',
        host: 'Host 1',
        city: 'Normal',
        state: 'IL',
        address: 'Address 1',
        date: '2019-07-03T19:26:38.918Z',
        url: 'http://www.event1.com',
        description: 'Description for New Event',
        status: 'Will Attend',
        user_id: 1
      }
      return supertest(app)
        .post(`/api/events`)
        .send(newEvent)
        .set('Authorization', helpers.makeAuthHeader(validCreds))
        .expect(201)
        .expect(res => {
          expect(res.body.event_name).to.eql(newEvent.event_name)
          expect(res.body.host).to.eql(newEvent.host)
          expect(res.body.city).to.eql(newEvent.city)
          expect(res.body.state).to.eql(newEvent.state)
          expect(res.body.address).to.eql(newEvent.address)
          expect(res.body.date).to.eql(newEvent.date)
          expect(res.body.url).to.eql(newEvent.url)
          expect(res.body.description).to.eql(newEvent.description)
          expect(res.body.status).to.eql(newEvent.status)
          expect(res.body.user_id).to.eql(newEvent.user_id)
          expect(res.body).to.have.property('event_id')
          expect(res.headers.location).to.eql(`/api/events/${res.body.event_id}`)
        })
    })
  })
})