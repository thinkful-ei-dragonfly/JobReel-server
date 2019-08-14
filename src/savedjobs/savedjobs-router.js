const express = require('express')
const path = require('path')
const JobService = require('./savedjobs-service')
const { requireAuth } = require('../middleware/jwt-auth')

const savedJobRouter = express.Router()
const bodyParser = express.json()

savedJobRouter
  .use(requireAuth)

savedJobRouter
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
  .post('/', bodyParser, async(req, res, next) => {
    const { job_title, company, city, state, date_added, url, description } = req.body
  
    for (const field of ['job_title', 'company', 'city', 'state', 'url'])
    if(!req.body[field]){
    return res.status(400).json({
      error: `Missing '${field}' in request body`
    })
  }

  function validateUrl(url) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
  }

  function validateState(el) {
    var states =    ["AK","AL","AR","AS","AZ","CA","CO","CT","DC","DE",
"FL","GA","GU","HI","IA",
"ID","IL","IN","KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT",
"NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","PR","PW","RI",
"SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"];
    for(var i=0;i< states.length;i++) {
      if(el.toUpperCase() == states[i]) {
        return true;
      }
    }
    return false;
}

  if(!validateState(state)){
    return res.status(400).json({
      error: 'Not a valid state code'
    })
  }

  if(!validateUrl(url)){
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