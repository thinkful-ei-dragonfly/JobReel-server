const express = require('express')
const eventbriteRouter = express.Router()
const config = require('../config')
const unirest = require('unirest')
const jsonBodyParser = express.json()

eventbriteRouter
  .route(`/`)
    .get((req, res, next) => { 
      res.send({url: `https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=I6MVEHHYVS3LD42Z46&redirect_uri=https://localhost:8000/api/eventbrite`})
    })
    // .post(jsonBodyParser, (req, res, next) => {
    //     // const {domain, company, seniority, department} = req.body.search
    //     unirest.get(`https://secure.meetup.com/oauth2/authorize
    //     ?client_id=67tbmv2gfetercp9rke84h8ale
    //     &response_type=token
    //     &redirect_uri=http://localhost:3000`)
    //     .end(function (result) {
    //         if (result.error) throw new Error(result.error)
    //         console.log(result)
    //         res.status(200).send(result.body);
    //     })
    // })


module.exports = eventbriteRouter
