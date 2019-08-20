const express = require('express')
const path = require('path')
const ContactService = require('./contacts-service')
const { requireAuth } = require('../middleware/jwt-auth')
const validationService = require('../validation-service')

const contactsRouter = express.Router()
const bodyParser = express.json()

contactsRouter
  .use(requireAuth)

contactsRouter
  .get('/', async (req, res, next) => {
    try {
      let contacts = await ContactService.getContacts(
        req.app.get('db'),
        req.user.id,
      )

      contacts = contacts.map(contact => {
        return ContactService.serializeContact(contact)
      })

      res.json({
        contacts
      })
      next()
    } catch(error) {
      next(error)
    }
  })
  .post('/', bodyParser, async(req, res, next) => {
    const { job_title, company, contact_name, email, linkedin, comments } = req.body
    const required = { job_title, company, contact_name }

    for (const [key, value] of Object.entries(required))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      })

  if(!validationService.validateUrl(req.body.linkedin)){
    return res.status(400).json({
      error: 'Not a valid linkedin URL'
    })
  }
  
    try {
      const newContact = {
        job_title,
        contact_name,
        company,
        email,
        linkedin,
        comments
      }

      newContact.user_id = req.user.id
  
      const contact = await ContactService.insertContact(
        req.app.get('db'),
        newContact
      )
  
      res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${contact.contact_id}`))
      .json(ContactService.serializeContact(contact))
    }
    catch(error){
      next(error)
    }
  })

  contactsRouter
  .all('/:contact_id', (req, res, next) => {
    ContactService.getById(
      req.app.get('db'),
      req.params.contact_id
    )
    .then(contact => {
      if(!contact){
        return res
        .status(404)
        .json({
          error: `Contact doesn't exist`
        })
      }
      res.contact = contact
      next()
    })
    .catch(next)
  })
  .get('/:contact_id', async (req, res, next) => {
    try {
      res
      .status(200)
      .json(
        ContactService.serializeContact(res.contact)
      )
      next()
    }
    catch(error){
      next(error)
    }
  })

  module.exports = contactsRouter