const path = require('path')
const express = require('express')
const EventsService = require('./events-service')
const { requireAuth } = require('../middleware/jwt-auth')

const eventsRouter = express.Router()
const jsonParser = express.json()

eventsRouter
  .use(requireAuth)

eventsRouter
  .get('/', async (req, res, next) => {
    try {
      const events = await EventsService.getEvents(
        req.app.get('db'),
        req.user.id
      )

      res
      .status(200)
      .json(
        events
      )
      next()
    }
    catch (error) {
      next(error)
    }
  })

  module.exports = eventsRouter