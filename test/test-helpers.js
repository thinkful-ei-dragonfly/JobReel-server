const knex = require('knex')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeKnexInstance(){
  return knex({
    client: 'pg',
    connection: process.env.TEST_DB_URL,
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
      user_id: 1, 
      job_id: 1,
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
      user_id: 1, 
      job_id: 2,
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

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      jobs,
      users
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  return db.into('users').insert(users)
}

function seedJobs(db, users, jobs) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('jobs').insert(jobs)
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
  makeExpectedJob
}

