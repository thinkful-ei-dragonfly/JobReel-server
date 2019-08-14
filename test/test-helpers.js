const knex = require('knex')
const config = require('../src/config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeKnexInstance(){
  return knex({
    client: 'pg',
    connection: config.TEST_DB_URL,
  })
}

function makeUsersArray(){
  return[
    {
      id: 1, 
      email: 'user1@email.com',
      first_name: 'First1',
      last_name: 'Last1',
      username: 'user1',
      password: 'Password1!',
    },
    {
      id: 2,
      email: 'user2@email.com',
      first_name: 'First2',
      last_name: 'Last2',
      username: 'user2',
      password: 'Password2!',
    }
  ]
}

function makeMaliciousUser(){
  const maliciousUser = {
    id: 911,
    email: `email@email.com <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`,
    first_name: `First <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`,
    last_name: `Last <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`,
    username: `username <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`,
    password: 'Password1!'
  }

  const expectedUser = {
    ...maliciousUser,
    email: `email@email.com <img src="https://url.to.file.which/does-not.exist">`,
    first_name: `First <img src="https://url.to.file.which/does-not.exist">`,
    last_name: `Last <img src="https://url.to.file.which/does-not.exist">`,
    username: `username <img src="https://url.to.file.which/does-not.exist">`,
  }
  return{
    maliciousUser,
    expectedUser,
  }
}

function makeEventsArray(){
  return [
    {
      event_id: 1,
      event_name: 'Event 1',
      host: 'Host 1',
      city: 'City1',
      state: 'State1',
      address: 'Address 1',
      date: '2019-07-03T19:26:38.918Z',
      url: 'http://event1.com',
      description: 'Description for Event 1',
      status: 'Will attend',
      user_id: 1
    },
    {
      event_id: 2,
      event_name: 'Event 2',
      host: 'Host 2',
      city: 'City2',
      state: 'State2',
      address: 'Address 2',
      date: '2019-07-03T19:26:38.918Z',
      url: 'http://event2.com',
      description: 'Description for Event 2',
      status: 'Interested',
      user_id: 2
    }
  ]
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET){
  const token = jwt.sign({ user_id: user.id}, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

function cleanTables(db){
  return db.raw('TRUNCATE users RESTART IDENTITY CASCADE')
}

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeMaliciousUser,
  makeEventsArray,
  makeAuthHeader,
  cleanTables
}

