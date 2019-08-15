const path = require('path')
const express = require('express')
const ResourcesService = require('./resources-service')
const { requireAuth } = require('../middleware/jwt-auth')

const resourcesRouter = express.Router()
const jsonParser = express.json()

resourcesRouter
.use(requireAuth)

resourcesRouter
.get('/', async (req, res, next) => {
  try{
    let resources = await ResourcesService.getResources(
      req.app.get('db'),
      req.user.id
    )

    resources = resources.map(resource => {
      return ResourcesService.serializeResource(resource)
    })

    res
    .status(200)
    .json(
      resources
    )
    next()
  }
  catch(error){
    next(error)
  }
})

module.exports = resourcesRouter