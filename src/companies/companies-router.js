const express = require('express')
const path = require('path')
const CompanyService = require('./companies-service')
const { requireAuth } = require('../middleware/jwt-auth')
const ValidationService = require('../validation-service')

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

      res.json(
        companies
      )
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

    if(!ValidationService.validateState(state)){
      return res.status(400).json({
        error: 'Not a valid state code'
      })
    }

    if(!ValidationService.validateUrl(website)){
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

    companiesRouter
    .all('/:company_id', (req, res, next) => {
      CompanyService.getById(
        req.app.get('db'),
        req.params.company_id
      )
      .then(company => {
        if(!company){
          return res
          .status(404)
          .json({
            error: `Company doesn't exist`
          })
        }
        res.company = company
        next()
      })
      .catch(next)
    })
    .get('/:company_id', async (req, res, next) => {
      try {
        res
        .status(200)
        .json(
          CompanyService.serializeCompany(res.company)
        )
        next()
      }
      catch(error){
        next(error)
      }
    })
    .delete('/:company_id', async (req, res, next) => {
      CompanyService.deleteCompany(
        req.app.get('db'),
        req.params.company_id
      )
      .then(numRowsAffected => {
        res
        .status(204)
        .end()
      })
      .catch(next)
    })
    .patch('/:company_id', bodyParser, (req, res, next) => {
      const { company_id } = req.params
      const { company_name, city, state, industry, website, description, contact, date_added } = req.body
      const updatedCompany = { company_name, city, state, industry, website, description, contact, date_added }

      const numberOfValues = Object.values(updatedCompany).filter(Boolean).length
      if(numberOfValues === 0){
        return res
        .status(400)
        .json({
          error: `Request body must contain either 'company_name', 'city', 'state', 'industry', 'website', 'description', 'contact', or 'date_added'`
        })
      }

      if(website){
        const validateUrl = ValidationService.validateUrl(website)
        if(!validateUrl){
          return res
          .status(400)
          .json({
            error: 'Not a valid URL'
          })
        }
      }

      if(state){
        const validateState = ValidationService.validateState(state)
        if(!validateState){
          return res
          .status(400)
          .json({
            error: 'Not a valid state code'
          })
        }
      }

      CompanyService.updateCompany(
        req.app.get('db'),
        company_id,
        updatedCompany
      )
      .then(numRowsAffected => {
        res
        .status(204)
        .end()
      })
      .catch(next)
    })

module.exports = companiesRouter