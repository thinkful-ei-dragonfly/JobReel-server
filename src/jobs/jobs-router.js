const express = require('express')
const JobService = require('./jobs-service')
const { requireAuth } = require('../middleware/jwt-auth')

const jobRouter = express.Router()
const bodyParser = express.json()

jobRouter
  .use(requireAuth)

jobRouter
  .get('/', async (req, res, next) => {
    try {
      const jobs = await JobService.getJobs(
        req.app.get('db'),
        req.user.id,
      )

      res.json({
        jobs
      })
      next()
    } catch(error) {
      next(error)
    }
  })


module.exports = jobRouter