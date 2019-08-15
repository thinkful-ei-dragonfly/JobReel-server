const express = require('express')
const path = require('path')
const CompanyService = require('./companies-service')
const { requireAuth } = require('../middleware/jwt-auth')
const validationService = require('../validation-service')

const companiesRouter = express.Router()
const bodyParser = express.json()

companiesRouter
  .use(requireAuth)

  companiesRouter
  .get('/', async (req, res, next) => {

  })

module.export = companiesRouter