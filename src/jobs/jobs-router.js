const express = require('express')
const JobsService = require('./jobs-service')
const jobsRouter = express.Router()
const unirest = require('unirest')
const config = require('../config')
const jsonBodyParser = express.json()


jobsRouter
    .route(`/authentic`)
    .post(jsonBodyParser, (req, res, next) => {
        console.log(req.body.search)
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

// jobsRouter
//     .route('/')
//     .post(jsonBodyParser, (req, res, next) => {  
//         unirest.get(`https://indeed-indeed.p.rapidapi.com/apisearch`)
//             .header("x-rapidapi-host", "indeed-indeed.p.rapidapi.com")
//             .header("x-rapidapi-key", "db5a101104mshcf69cbd8b65f653p1ddc40jsn7f91d36c4804")
//             .end(function (res) {
//                 if (res.error) throw new Error(res.error);
//                 console.log(res.body)
//                 res.status(200).send(res.body);
//             })
//     })

// jobsRouter
//     .route(`/job`)
//     .post(jsonBodyParser, (req, res, next) => {
//         const { jobkey } = req.body
//         unirest.get(`https://indeed-indeed.p.rapidapi.com/apigetjobs`)
//             .header("x-rapidapi-host", "indeed-indeed.p.rapidapi.com")
//             .header("x-rapidapi-key", "db5a101104mshcf69cbd8b65f653p1ddc40jsn7f91d36c4804")
//             .end(function (res) {
//                 if (res.error) throw new Error(res.error);
//                 console.log(res.body)
//                 res.status(200).send(res.body);
//             })
//     })

module.exports = jobsRouter