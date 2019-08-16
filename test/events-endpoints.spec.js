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
        return helpers.seedUsers(db, testUsers)
          .then(() => {
            return helpers.seedEvents(db, testEvents)
          })
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
        return helpers.seedUsers(db, testUsers)
          .then(() => {
            return helpers.seedEvents(db, testEvents)
          })
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

  describe('GET /api/events/:event_id', () => {
    const testUsers = helpers.makeUsersArray()
    const validCreds = { username: testUsers[0].username, password: testUsers[0].password }

    beforeEach('insert users', () => {
      return helpers.seedUsers(db, testUsers)
    })

    context(`Given no events`, () => {
      it(`responds 404 whe event doesn't exist`, () => {
        return supertest(app)
          .get(`/api/events/123`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: { message: `Event Not Found` }
          })
      })
    })

    context('Given there are events in the database', () => {
      const testEvents = helpers.makeEventsArray()

      beforeEach('insert events', () => {
        return db
          .into('events')
          .insert(testEvents)
      })

      it('responds with 200 and the specified event', () => {
        const eventId = 2
        const expectedEvent = testEvents[eventId - 1]

        return supertest(app)
          .get(`/api/events/${eventId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(200, expectedEvent)
      })
    })
  })

  describe('DELETE /api/events/:id', () => {
    const testUsers = helpers.makeUsersArray()
    const validCreds = { username: testUsers[0].username, password: testUsers[0].password }

    beforeEach('insert users', () => {
      return helpers.seedUsers(db, testUsers)
    })

    context(`Given no events`, () => {
      it(`responds 404 when event doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/events/123`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, {
            error: { message: `Event Not Found` }
          })
      })
    })

    context('Given there are events in the database', () => {
      const testEvents = helpers.makeEventsArray()

      beforeEach('insert events', () => {
        return db
          .into('events')
          .insert(testEvents)
      })

      it('removes the event by ID from the store', () => {
        const idToRemove = 2
        const expectedEvents = testEvents.filter(event => event.event_id !== idToRemove)
        return supertest(app)
          .delete(`/api/events/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/events`)
              .set('Authorization', helpers.makeAuthHeader(validCreds))
              .expect(expectedEvents)
          )
      })
    })
  })

  describe.only(`PATCH /api/events/:event_id`, () => {
    const testUsers = helpers.makeUsersArray()
    const validCreds = { username: testUsers[0].username, password: testUsers[0].password }

    beforeEach('insert users', () => {
      return helpers.seedUsers(db, testUsers)
    })

    context(`Given no events`, () => {
      it(`responds with 404`, () => {
        const eventId = 123456
        return supertest(app)
          .patch(`/api/events/${eventId}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .expect(404, { error: { message: `Event Not Found` } })
      })
    })

    context.only('Given there are events in the database', () => {
      const testEvents = helpers.makeEventsArray()

      beforeEach('insert events', () => {
        return db
          .into('events')
          .insert(testEvents)
      })

      it('responds with 204 and updates the event', () => {
        const idToUpdate = 2
        const updatedEvent = {
            event_name: "Event 100",
            host: "Host 100",
            city: "City 100",
        }
  
        const expectedEvent = {
          ...testEvents[idToUpdate - 1],
          ...updatedEvent
        }
        return supertest(app)
          .patch(`/api/events/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .send(updatedEvent)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/events/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(validCreds))
              .expect(expectedEvent)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/events/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must content either event_name, host, city, state, address, date, url, description, or status`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updatedEvent = {
          event_name: 'Updated event title',
        }
        const expectedEvent = {
          ...testEvents[idToUpdate - 1],
          ...updatedEvent
        }

        return supertest(app)
          .patch(`/api/events/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .send({
            ...updatedEvent,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/events/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(validCreds))
              .expect(expectedEvent)
          )
      })

      it(`responds with 400 and error message about invalid url`, () => {
        const idToUpdate = 2
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        const invalidUrl = {
          url: 'www.invalid.com',
        }
  
        return supertest(app)
          .patch(`/api/events/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .send(invalidUrl)
          .expect(400, {
            error: 'Not a valid URL'
          })
      })
  
      it(`responds with 400 and error message about invalid state code`, () => {
        const idToUpdate = 2
        const validCreds = { username: testUsers[0].username, password: testUsers[0].password }
        const invalidState = {
          state: 'Unknown State',
        }
  
        return supertest(app)
          .patch(`/api/events/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(validCreds))
          .send(invalidState)
          .expect(400, {
            error: 'Not a valid state code'
          })
      })
    })
  })
})