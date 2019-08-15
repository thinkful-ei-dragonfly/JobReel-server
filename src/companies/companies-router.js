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
    try {
      let companies = await CompanyService.getCompanies(
        req.app.get('db'),
        req.user.id,
      )

      companies = companies.map(company => {
        return CompanyService.serializeCompany(company)
      })

      res.json({
        companies
      })
      next()
    } catch(error) {
      next(error)
    }
  })

module.exports = companiesRouter