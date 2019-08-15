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
  .post('/', bodyParser, async(req, res, next) => {
    const { company_name, city, state, industry, website, description, contact } = req.body
    const required = { company_name, city, state }

    for (const [key, value] of Object.entries(required))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      })

    if(!validationService.validateState(state)){
      return res.status(400).json({
        error: 'Not a valid state code'
      })
    }

    if(!validationService.validateUrl(website)){
      return res.status(400).json({
        error: 'Not a valid URL'
      })
    }

    try {
      const newCompany = {
        company_name,
        city,
        state,
        industry,
        website,
        description,
        contact
      }

      newCompany.user_id = req.user.id
  
      const company = await CompanyService.insertCompany(
        req.app.get('db'),
        newCompany
      )
  
      res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${company.company_id}`))
      .json(CompanyService.serializeCompany(company))
    }
    catch(error){
      next(error)
    }
    })

module.exports = companiesRouter