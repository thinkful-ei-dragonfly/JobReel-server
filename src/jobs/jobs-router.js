const express = require('express')
const jobsRouter = express.Router()
const unirest = require('unirest')
const config = require('../config')
const jsonBodyParser = express.json()


jobsRouter
    .route(`/authentic`)
    .post(jsonBodyParser, (req, res, next) => {
        const {jobTitle, location} = req.body.search
        unirest.get(`https://authenticjobs.com/api/?api_key=${config.AUTHENTIC_JOBS_API_TOKEN}&method=aj.jobs.search&keywords=${jobTitle}&location=${location}&format=json`)
            .end(function (result) {
                if (result.error) throw new Error(result.error)
                res.status(200).send(result.body);
            })
    })


jobsRouter
    .route(`/github`)
    .post(jsonBodyParser, (req, res, next) => {
        const {jobTitle, location} = req.body.search
        unirest.get(`https://jobs.github.com/positions.json?description=${jobTitle}&location=${location}`)
            .end(jobs => {
                if (jobs.error) throw new Error(jobs.error)
                res.status(200).send(jobs.body);
            })

    })
module.exports = jobsRouter