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
.post('/', jsonParser, async (req, res, next) => {
  const { type, title, description, date_added } = req.body

  for(const field of ['type', 'title', 'date_added'])
  if(!req.body[field]){
    return res
    .status(400)
    .json(
      {
        error: `Missing '${field}' in request body`
      }
    )
  }

  try{
    const newResource = {
      type,
      title,
      description,
      date_added
    }

    newResource.user_id = req.user.id

    const resource = await ResourcesService.insertResource(
      req.app.get('db'),
      newResource
    )
    
    res
    .status(201)
    .location(path.posix.join(req.originalUrl, `/${resource.resource_id}`))
    .json(ResourcesService.serializeResource(resource))
  }
  catch(error){
    next(error)
  }
})

resourcesRouter
.all('/:resource_id', (req, res, next) => {
  ResourcesService.getById(
    req.app.get('db'),
    req.params.resource_id
  )
  .then(resource => {
    if(!resource){
      return res
      .status(404)
      .json({
        error: `Resource doesn't exist`
      })
    }
    res.resource = resource
    next()
  })
  .catch(next)
})
.get('/:resource_id', async (req, res, next) => {
  try {
    res
    .status(200)
    .json(
      ResourcesService.serializeResource(res.resource)
    )
    next()
  }
  catch(error){
    next(error)
  }
})
.delete('/:resource_id', async (req, res, next) => {
  ResourcesService.deleteResource(
    req.app.get('db'),
    req.params.resource_id
  )
  .then(numRowsAffected => {
    res
    .status(204)
    .end()
  })
  .catch(next)
})

module.exports = resourcesRouter