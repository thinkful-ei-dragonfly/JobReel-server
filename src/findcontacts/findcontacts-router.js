const express = require('express')
const hunterRouter = express.Router()
const unirest = require('unirest')
const config = require('../config')
const jsonBodyParser = express.json()
 

hunterRouter
    .route(`/`)
    .post(jsonBodyParser, (req, res, next) => {
        const {domain, company, seniority, department} = req.body.search
        unirest.get(`https://api.hunter.io/v2/domain-search?domain=${domain}&company=${company}&seniority=${seniority}&department=${department}&limit=50&api_key=${config.HUNTER_API_TOKEN}`)
        .end(function (result) {
            if (result.error) return next(result.error)
            res.status(200).send(result.body);
        })
    })


module.exports = hunterRouter