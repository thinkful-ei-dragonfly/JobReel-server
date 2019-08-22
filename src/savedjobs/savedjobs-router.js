const express = require('express')
const path = require('path')
const JobService = require('./savedjobs-service')
const { requireAuth } = require('../middleware/jwt-auth')
const ValidationService = require('../validation-service')

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

      res.json(
        jobs
      )
      next()
    } catch (error) {
      next(error)
    }
  })
  .post('/', bodyParser, async (req, res, next) => {
    const { job_title, company, city, state, date_added, url, description } = req.body
    const required = {
      job_title,
      company,
      city,
      // state,
      url,
    }

    for (const [key, value] of Object.entries(required))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    // if (state) {
    //   if (!ValidationService.validateState(state)) {
    //     return res.status(400).json({
    //       error: 'Not a valid state code'
    //     })
    //   }
    // }

    if (!ValidationService.validateUrl(url)) {
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
    catch (error) {
      next(error)
    }
  })

savedJobRouter
  .all('/:job_id', (req, res, next) => {
    JobService.getById(
      req.app.get('db'),
      req.params.job_id
    )
      .then(job => {
        if (!job) {
          return res
            .status(404)
            .json({
              error: `Job doesn't exist`
            })
        }
        res.job = job
        next()
      })
      .catch(next)
  })
  .get('/:job_id', async (req, res, next) => {
    try {
      res
        .status(200)
        .json(
          JobService.serializeJob(res.job)
        )
      next()
    }
    catch (error) {
      next(error)
    }
  })
  .delete('/:job_id', async (req, res, next) => {
    JobService.deleteJob(
      req.app.get('db'),
      req.params.job_id
    )
      .then(numRowsAffected => {
        res
          .status(204)
          .end()
      })
      .catch(next)
  })
  .patch('/:job_id', bodyParser, (req, res, next) => {
    const { job_id } = req.params
    const { job_title, company, city, state, date_added, url, description, status } = req.body
    const updatedJob = { job_title, company, city, state, date_added, url, description, status }

    const numberOfValues = Object.values(updatedJob).filter(Boolean).length
    if (numberOfValues === 0) {
      return res
        .status(400)
        .json({
          error: `Request body must contain either 'job_title', 'company', 'city', 'state', 'date_added', 'url', or 'description'`
        })
    }

    if (url) {
      const validateUrl = ValidationService.validateUrl(url)
      if (!validateUrl) {
        return res
          .status(400)
          .json({
            error: 'Not a valid URL'
          })
      }
    }

    // if (state) {
    //   const validateState = ValidationService.validateState(state)
    //   if (!validateState) {
    //     return res
    //       .status(400)
    //       .json({
    //         error: 'Not a valid state code'
    //       })
    //   }
    // }

    JobService.updateJob(
      req.app.get('db'),
      job_id,
      updatedJob
    )
      .then(numRowsAffected => {
        res
          .status(204)
          .end()
      })
      .catch(next)
  })


module.exports = savedJobRouter