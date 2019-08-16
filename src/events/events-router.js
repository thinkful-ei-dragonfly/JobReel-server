const path = require('path')
const express = require('express')
const EventsService = require('./events-service')
const ValidationService = require('../validation-service')
const { requireAuth } = require('../middleware/jwt-auth')

const eventsRouter = express.Router()
const jsonParser = express.json()

eventsRouter
  .use(requireAuth)

eventsRouter
  .get('/', async (req, res, next) => {
    try {
      let events = await EventsService.getEvents(
        req.app.get('db'),
        req.user.id
      )

      events = events.map(event => {
        return EventsService.serializeEvent(event)
      })

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

    // for(const field of ['event_name', 'host', 'city', 'state', 'address', 'date', 'url', 'description', 'status', 'user_id'])
    for(const field of ['event_name', 'host', 'city', 'state', 'date', 'url'])
    if(!req.body[field]){
      return res
      .status(400)
      .json(
        {
          error: `Missing '${field}' in request body`
        }
      )
    }

    const validateUrl = ValidationService.validateUrl(url)

    if(!validateUrl){
      return res
      .status(400)
      .json({
        error: 'Not a valid URL'
      })
    }
    
    const validateState = ValidationService.validateState(state)

    if(!validateState){
      return res
      .status(400)
      .json({
        error: 'Not a valid state code'
      })
    }
    
    try{
      const newEvent = {
        event_name, 
        host, 
        city, 
        state, 
        address, 
        date, 
        url, 
        description, 
        status
      }

      newEvent.user_id = req.user.id

      const event = await EventsService.insertEvent(
        req.app.get('db'),
        newEvent
      )

      res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${event.event_id}`))
      .json(EventsService.serializeEvent(event))
    }
    catch(error){
      next(error)
    }
  })

  eventsRouter
  .all('/:event_id', (req, res, next) => {
    const { event_id } = req.params
    EventsService.getById(req.app.get('db'), event_id)
      .then(event => {
        if (!event) {
          return res
          .status(404)
          .json({
            error: `Event Not Found` 
          })
        }
        res.event = event
        next()
      })
      .catch(next)
  })
  .get('/:event_id', async (req, res, next) => {
    try {
      res
      .status(200)
      .json(
        EventsService.serializeEvent(res.event)
      )
      next()
    }
    catch (error) {
      next(error)
    }
  })
  .delete('/:event_id', async (req, res, next) => {
    const { event_id } = req.params
    EventsService.deleteEvent(
      req.app.get('db'),
      event_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch('/:event_id', jsonParser, (req, res, next) => {
    const { event_id } = req.params
    const { event_name, host, city, state, address, date, url, description, status } = req.body
    const updatedEvent = { event_name, host, city, state, address, date, url, description, status }

    const numberOfValues = Object.values(updatedEvent).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error:  `Request body must contain either event_name, host, city, state, address, date, url, description, or status`
        
      })
    }

    if(url){
      const validateUrl = ValidationService.validateUrl(url)
      if(!validateUrl){
        return res
        .status(400)
        .json({
          error: 'Not a valid URL'
        })
      }
    }
    
    if(state){
      const validateState = ValidationService.validateState(state)
      if(!validateState){
        return res
        .status(400)
        .json({
          error: 'Not a valid state code'
        })
      }
    }

    EventsService.updateEvent(
      req.app.get('db'),
      event_id,
      updatedEvent
    )
    .then(numRowsAffected => {
      res.status(204).end()
    })
    .catch(next)
  })

  module.exports = eventsRouter