const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')
const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
  .post('/', jsonBodyParser, async (req, res, next) => {
    const { email, first_name, last_name, username, password } = req.body

    for (const field of ['email', 'first_name', 'last_name', 'username', 'password'])
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })
      }

    try {
      const passwordError = UsersService.validatePassword(password)

      if (passwordError) {
        return res.status(400).json({
          error: passwordError
        })
      }
      const hasUserWithUserName = await UsersService.hasUserWithUserName(
        req.app.get('db'),
        username
      )

      if (hasUserWithUserName) {
        return res.status(400).json({
          error: `Username already taken`
        })
      }

      const hasUserWithEmail = await UsersService.hasUserWithEmail(
        req.app.get('db'),
        email
      )

      if (hasUserWithEmail) {
        return res.status(400).json({
          error: `Email already taken`
        })
      }

      const hashedPassword = await UsersService.hashPassword(password)

      const newUser = {
        email,
        first_name,
        last_name,
        username,
        password: hashedPassword
      }

      const user = await UsersService.insertUser(
        req.app.get('db'),
        newUser
      )

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${user.id}`))
        .json(UsersService.serializeUser(user))
    }
    catch (error) {
      next(error)
    }
  })

usersRouter
  .use(requireAuth)
  .all('/:id', (req, res, next) => {
    UsersService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(user => {
        if (!user) {
          return res
            .status(404)
            .json({
              error: `User doesn't exist`
            })
        }
        res.user = user
        next()
      })
      .catch(next)
  })
  .get('/:id', (req, res, next) => {
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(401)
        .json(
          { error: 'Unauthorized request' }
        )

    }
    else {
      return res.status(200)
        .json(
          UsersService.serializeUser(res.user)
        )
    }
  })
  .delete('/:id', (req, res, next) => {
    if(req.user.id !== parseInt(req.params.id)){
      return res.status(401)
      .json(
        {
          error: 'Unauthorized request'
        }
      )
    }
    else{
    UsersService.deleteUser(
      req.app.get('db'),
      req.params.id
    )
    .then(numRowsAffected => {
       res
      .status(204)
      .end()
    })
    .catch(next)
  }
  })

module.exports = usersRouter