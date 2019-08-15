const path = require('path')
const express = require('express')
const ResourcesService = require('./resources-service')
const { requireAuth } = require('../middleware/jwt-auth')

const resourcesRouter = express.Router()
const jsonParser = express.json()

resourcesRouter
.use(requireAuth)

module.exports = resourcesRouter