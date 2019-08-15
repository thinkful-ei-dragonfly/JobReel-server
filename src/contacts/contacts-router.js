const express = require('express')
const path = require('path')
const ContactService = require('./contacts-service')
const { requireAuth } = require('../middleware/jwt-auth')

const contactsRouter = express.Router()
const bodyParser = express.json()

contactsRouter
  .use(requireAuth)

contactsRouter
  .get('/', async (req, res, next) => {

  })

  module.exports = contactsRouter