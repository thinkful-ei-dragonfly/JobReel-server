const express = require('express')
const meetupRouter = express.Router()
const config = require('../config')
const jsonBodyParser = express.json()
const passport = require('passport')

const MeetupOAuth2Strategy = require('passport-oauth2-meetup').Strategy;

passport.use(new MeetupOAuth2Strategy({
  clientID: '67tbmv2gfetercp9rke84h8ale',
  clientSecret: '2a9ev7ddp43n80sn9e47eb7q5r',
  code: 'token',
  callbackURL: "http://localhost:3000",
  autoGenerateUsername: true
},
  function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }));

meetupRouter
  .route(`/auth`)
  .post(jsonBodyParser, passport.authenticate('meetup', { session: false }), 
    (req, res, next) => {
      console.log('a string')
      // if (!req.user.username && !req.user.email) {
      //   if (!req.user || provider != 'meetup') return next(new Error('Neither a username nor email was available'));
      // }
      res.json(req.user);
    });

meetupRouter
  .route('/auth/callback')
  .get(passport.authenticate('provider', {
    successRedirect: 'http://localhost:3000/meetups',
    failureRedirect: 'http://localhost:3000/meetups'
  }));

module.exports = meetupRouter
