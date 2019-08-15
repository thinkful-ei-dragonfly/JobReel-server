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
  .post('/', jsonParser, async (req, res, next) => {
    const { event_name, host, city, state, address, date, url, description, status } = req.body

    for(const field of ['event_name', 'host', 'city', 'state', 'address', 'date', 'url', 'description', 'status'])
    if(!req.body[field]){
      return res
      .status(400)
      .json(
        {
          error: `Missing '${field}' in request body`
        }
      )
    }

    
  })

  module.exports = eventsRouter