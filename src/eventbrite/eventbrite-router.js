const express = require('express')
const eventbriteRouter = express.Router()
const config = require('../config')
const unirest = require('unirest')
const jsonBodyParser = express.json()

eventbriteRouter
  .route(`/`)
    .get((req, res, next) => { 
      res.send({url: `https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=I6MVEHHYVS3LD42Z46&redirect_uri=https://stormy-beyond-18995.herokuapp.com/api/eventbrite`})
    })
    .post(jsonBodyParser, (req, res, next) => {
        // const {domain, company, seniority, department} = req.body.search
        unirest.get()
    })


module.exports = eventbriteRouter
