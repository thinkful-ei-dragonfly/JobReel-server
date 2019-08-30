const express = require('express')
const jobsRouter = express.Router()
const unirest = require('unirest')
const config = require('../config')
const jsonBodyParser = express.json()
const { requireAuth } = require('../middleware/jwt-auth')

// jobsRouter
//   .use(requireAuth)

jobsRouter
    .route(`/authentic`)
    .post(jsonBodyParser, (req, res, next) => {
        if ((Object.keys(req.body.search).length === 0)) {
            return res.status(400).json({
                error: `Missing search in request body`
            })
        } else {
            const { jobTitle, location } = req.body.search
            unirest.get(`https://authenticjobs.com/api/?api_key=${config.AUTHENTIC_JOBS_API_TOKEN}&method=aj.jobs.search&keywords=${jobTitle}&location=${location}&format=json`)
                .end(function (result) {
                    if (result.error) {
                        return res.status(400).json({
                            error: `No results.`
                        })
                    } else {
                        res.status(200).send(result.body);
                    }
                })
        }
    })



jobsRouter
    .route(`/github`)
    .post(jsonBodyParser, (req, res, next) => {
        if ((Object.keys(req.body.search).length === 0)) {
            return res.status(400).json({
                error: `Missing search in request body`
            })
        } else {
            const { jobTitle, location } = req.body.search
            unirest.get(`https://jobs.github.com/positions.json?description=${jobTitle}&location=${location}`)
                .end(jobs => {
                    if (jobs.error) throw new Error(jobs.error)
                    res.status(200).send(jobs.body);
                })
        }
    })
module.exports = jobsRouter