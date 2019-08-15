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
    try {
      const contacts = await ContactService.getContacts(
        req.app.get('db'),
        req.user.id,
      )

      res.json({
        contacts
      })
      next()
    } catch(error) {
      next(error)
    }
  })

  module.exports = contactsRouter