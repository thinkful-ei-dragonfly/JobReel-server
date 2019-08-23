require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const authRouter = require('./auth/auth-router')
const usersRouter = require('./users/users-router')
const savedJobRouter = require('./savedjobs/savedjobs-router')
const eventsRouter = require('./events/events-router')
const jobsRouter = require('./jobs/jobs-router')
const resourcesRouter = require('./resources/resources-router')
const contactsRouter = require('./contacts/contacts-router')
const companiesRouter = require('./companies/companies-router')
const eventbriteRouter = require('./eventbrite/eventbrite-router.js')
const hunterRouter = require('./findcontacts/findcontacts-router.js')


const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())


app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/savedjobs', savedJobRouter)
app.use('/api/events', eventsRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/resources', resourcesRouter)
app.use('/api/contacts', contactsRouter)
app.use('/api/companies', companiesRouter)
app.use('/api/eventbrite', eventbriteRouter)
app.use('/api/findcontacts', hunterRouter)

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app