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

function makeJobsArray(){
  return[
    {
      job_id: 1,
      user_id: 1, 
      job_title: 'Engineer',
      company: 'Company A',
      city: 'New York City',
      state: 'NY',
      date_added: "2019-08-14T17:18:19.306Z",
      url: 'http://www.thinkful.com',
      description: 'Engineering job',
      status: 'Interested',
    },
    {
      job_id: 2,
      user_id: 1, 
      job_title: 'UI Designer',
      company: 'Company B',
      city: 'Austin',
      state: 'TX',
      date_added: "2019-08-14T17:18:19.306Z",
      url: 'http://www.google.com',
      description: 'UI job',
      status: 'Interested',

    }
  ]
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

function makeContactsArray(){
  return [
    {
      contact_id: 1,
      contact_name: 'Contact 1',
      job_title: 'Engineer',
      company: 'Company1',
      email: 'email@email.com',
      linkedin: 'http://www.linkedin.com/person1',
      comments: 'Contact 1 comments',
      date_added: '2019-07-03T19:26:38.918Z',
      connected: false,
      user_id: 1
    },
    {
      contact_id: 2,
      contact_name: 'Contact 2',
      job_title: 'Analyst',
      company: 'Company2',
      email: 'email2@email.com',
      linkedin: 'http://www.linkedin.com/person2',
      comments: 'Contact 2 comments',
      date_added: '2019-07-03T19:26:38.918Z',
      connected: true,
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

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      contacts,
      jobs,
      users
      RESTART IDENTITY CASCADE`
  );
}

// function cleanTables(db){
//   return db.raw('TRUNCATE users RESTART IDENTITY CASCADE')
// }

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers) 
}

// function seedUsers(db, users) { 
//   const preppedUsers = users.map(user => ({
//     ...user,
//     password: bcrypt.hashSync(user.password, 1)
//   }))
//   return db.transaction(async trx => {
//     await trx.into('users').insert(preppedUsers)
//   })
// }

function seedJobs(db, users, jobs) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('jobs').insert(jobs)
  })
}

function seedContacts(db, users, contacts) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('contacts').insert(contacts)
  })
}

function makeExpectedJob(users, job) {
  const user = users
    .find(user => user.id === job.user_id)

  return {
    job_id: job.job_id,
    job_title: job.job_title,
    company: job.company,
    city: job.city,
    state: job.state,
    date_added: job.date_added,
    url: job.url,
    description: job.description,
    status: job.status,
  }
}

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeMaliciousUser,
  makeJobsArray,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  seedJobs,
  seedContacts,
  makeExpectedJob,
  makeEventsArray,
  makeContactsArray
}

