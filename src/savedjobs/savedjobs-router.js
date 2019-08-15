const express = require('express')
const path = require('path')
const JobService = require('./savedjobs-service')
const { requireAuth } = require('../middleware/jwt-auth')
const validationService = require('../validation-service')

const savedJobRouter = express.Router()
const bodyParser = express.json()

savedJobRouter
  .use(requireAuth)

savedJobRouter
  .get('/', async (req, res, next) => {
    try {
      let jobs = await JobService.getJobs(
        req.app.get('db'),
        req.user.id,
      )

      jobs = jobs.map(job => {
        return JobService.serializeJob(job)
      })

      res.json({
        jobs
      })
      next()
    } catch(error) {
      next(error)
    }
  })
  .post('/', bodyParser, async(req, res, next) => {
    const { job_title, company, city, state, date_added, url, description } = req.body
    const required = {
      job_title,
      company,
      city,
      state,
      url,
    }

    for (const [key, value] of Object.entries(required))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      });

  if(!validationService.validateState(req.body.state)){
    return res.status(400).json({
      error: 'Not a valid state code'
    })
  }

  if(!validationService.validateUrl(req.body.url)){
    return res.status(400).json({
      error: 'Not a valid URL'
    })
  }
  
    try {
      const newJob = {
        job_title,
        company,
        city,
        state,
        date_added,
        url,
        description
      }

      newJob.user_id = req.user.id
  
      const job = await JobService.insertJob(
        req.app.get('db'),
        newJob
      )
  
      res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${job.job_id}`))
      .json(JobService.serializeJob(job))
    }
    catch(error){
      next(error)
    }
  })


module.exports = savedJobRouter