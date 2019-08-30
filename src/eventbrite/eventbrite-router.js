const express = require('express')
const eventbriteRouter = express.Router()
const config = require('../config')
const unirest = require('unirest')
const jsonBodyParser = express.json()
const { requireAuth } = require('../middleware/jwt-auth')

// eventbriteRouter
//   .use(requireAuth)

let userToken;

eventbriteRouter
  .route(`/`)
  .get((req, res, next) => {
    res.send({ url: `https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=${config.CLIENT_ID}&redirect_uri=https://stormy-beyond-18995.herokuapp.com/api/eventbrite/access` })
  })

eventbriteRouter
  .route(`/access`)
  .get((req, res, next) => {
    const code = req.query.code
    unirest.post('https://www.eventbrite.com/oauth/token')
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .send({ grant_type: "authorization_code", client_id: `${config.CLIENT_ID}`, client_secret: `${config.CLIENT_SECRET}`, code: `${code}`, redirect_uri: 'https://stormy-beyond-18995.herokuapp.com/api/eventbrite/token' })
      .end(function (response) {
        userToken = response.body.access_token
        res.redirect('https://jobreel.now.sh/eventbritesearch')
      });
  })

eventbriteRouter
  .route(`/categoriesbyID`)
  .post(jsonBodyParser, (req, res, next) => {
    if ((Object.keys(req.body.category).length === 0)) {
      return res.status(400).json({
        error: `Missing category in request body`
      })
    } else {
      const { id } = req.body.category
      const token = userToken
      unirest.get(`https://www.eventbriteapi.com/v3/categories/${id}/`)
        .headers({ 'Authorization': `Bearer ${token}` })
        .end(function (response) {
          res.send(response.body)
        });
    }
  })

eventbriteRouter
  .route(`/events`)
  .post(jsonBodyParser, (req, res, next) => {
    const token = userToken
    if ((Object.keys(req.body.search).length === 0)) {
      return res.status(400).json({
        error: `Missing category in request body`
      })
    } else {
      if (req.body.search.category === '' && req.body.search.subcategory === '') {
        const { query, location } = req.body.search
        unirest.get(`https://www.eventbriteapi.com/v3/events/search/?q=${query}&location.address=${location}&location.within=40km&sort_by=date`)
          .headers({ 'Authorization': `Bearer ${token}` })
          .end(function (response) {
            res.send(response.body)
          });
      }
      if (req.body.search.category) {
        const { query, location, category, subcategory } = req.body.search
        unirest.get(`https://www.eventbriteapi.com/v3/events/search/?q=${query}&location.address=${location}&location.within=40km&categories=${category}&subcategories=${subcategory}&sort_by=date`)
          .headers({ 'Authorization': `Bearer ${token}` })
          .end(function (response) {
            res.send(response.body)
          });
      }
    }
  })


//eventbrite continuation tokens for event currently not working or depracated
// eventbriteRouter
//   .route(`/paginated`)
//   .post(jsonBodyParser, (req, res, next) => {
//     const token = userToken
//     console.log(req.body, 'paginated sring')
//     console.log(req.body.page, 'page number string')
//     if (!req.body.search.query || !req.body.search.location) {
//       throw error({ message: 'Query and location are both required fields' })
//     }
//     if (req.body.search.category === '' && req.body.search.subcategory === '') {
//       const { query, location } = req.body.search
//       const {page_number} = req.body.page
//       console.log(page_number)
//       unirest.get(`https://www.eventbriteapi.com/v3/events/search/?q=${query}&location.address=${location}&location.within=40km&sort_by=date&continuation=${page_number}`)
//         .headers({ 'Authorization': `Bearer ${token}` })
//         .end(function (response) {
//           res.send(response.body)
//         });
//     }
//     if (req.body.search.category) {
//       const { query, location, category, subcategory} = req.body.search
//       const {page_number} = req.body.page
//       unirest.get(`https://www.eventbriteapi.com/v3/events/search/?q=${query}&location.address=${location}&location.within=40km&categories=${category}&subcategories=${subcategory}&sort_by=date&continuation=${page_number}`)
//         .headers({ 'Authorization': `Bearer ${token}` })
//         .end(function (response) {
//           res.send(response.body)
//         });
//     }
//   })

eventbriteRouter
  .route(`/venue`)
  .post(jsonBodyParser, (req, res, next) => {
    const { id } = req.body.venue
    const token = userToken
    unirest.get(`https://www.eventbriteapi.com/v3/venues/${id}/`)
      .headers({ 'Authorization': `Bearer ${token}` })
      .end(function (response) {
        res.send(response.body)
      });
  })

eventbriteRouter
  .route(`/organization`)
  .post(jsonBodyParser, (req, res, next) => {
    const { id } = req.body.organization
    const token = userToken
    unirest.get(`https://www.eventbriteapi.com/v3/organizations/${id}/`)
      .headers({ 'Authorization': `Bearer ${token}` })
      .end(function (response) {
        res.send(response.body)
      });
  })

// eventbriteRouter
// .route(`/eventbyid`)
// .post(jsonBodyParser, (req, res, next) => {
//   const { id } = req.body.event
//   const token = userToken
//   console.log(token, 'token string')
//   console.log(req.body, 'venue string one')
//   console.log(id, 'venute two')
//   unirest.get(`https://www.eventbriteapi.com/v3/events/${id}/`)
//     .headers({ 'Authorization': `Bearer ${token}` })
//     .end(function (response) {
//       res.send(response.body)
//     }


// eventbriteRouter
//   .route(`/categories`)
//   .get((req, res, next) => {
//     const token = userToken
//     unirest.get('https://www.eventbriteapi.com/v3/categories/')
//       .headers({ 'Authorization': `Bearer ${token}` })
//       .end(function (response) {
//         res.send(response.body)
//       });
//   })

// eventbriteRouter
//   .route(`/locations`)
//   .post(jsonBodyParser, (req, res, next) => {
//     const token = userToken
//     console.log(req.body.location)
//     const { address } = req.body.location
//     unirest.get(`https://www.eventbriteapi.com/v3/events/search?location.address=${address}&location.within=10km&expand=venue&q=javascript`)
//       .headers({ 'Authorization': `Bearer ${token}` })
//       .send({ continuation: "" })
//       .end(function (response) {
//         res.send(response.body)
//       });
//   })

// eventbriteRouter
//   .route(`/subcategories`)
//   .get((req, res, next) => {
//     const token = userToken
//     unirest.get('https://www.eventbriteapi.com/v3/subcategories?continuation=eyJwYWdlIjogMn0')
//       .headers({ 'Authorization': `Bearer ${token}` })
//       .end(function (response) {
//         res.send(response.body)
//       });
//   }












module.exports = eventbriteRouter
