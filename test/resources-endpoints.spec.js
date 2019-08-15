const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Resources Enpoints', () => {
  let db

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  before('cleanup', () => db.raw('TRUNCATE  users, resources RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users, resources RESTART IDENTITY CASCADE'))

  
})