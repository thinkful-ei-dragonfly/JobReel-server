// const app = require('../src/app')
// const helpers = require('./test-helpers')
// const config = require('../src/config')
// var request = require('supertest')(app);
// let {token} = require('../src/eventbrite/eventbrite-router')


// describe.only('EventBrite Endpoints', function () {

//     describe.only('GET /api/incidents', function () {

//         it('requires authorization', function(done) {
//             request
//                 .get('/api/eventbrite')
//                 .expect(401)
//                 .end(function(err, res) {
//                     if (err) return done(err);
//                     done();
//                 });
//         });

//         let auth = {};
//         before(loginUser(auth));

//         it('should respond with a token', function (done) {
//             request
//                 .get('/api/events')
//                 .set('Authorization', 'bearer ' + auth.token)
//                 .expect(200)
//                 .expect('Content-Type', /json/)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     res.body.should.be.instanceof(Array);
//                     done();
//                 });
//         });

//     });

//     function loginUser(auth) {
//         return function (done) {
//             request
//                 .post('/auth/local')
//                 .send({
//                     email: 'test@test.com',
//                     password: 'test'
//                 })
//                 .expect(200)
//                 .end(onResponse);

//             function onResponse(err, res) {
//                 auth.token = res.body.token;
//                 return done();
//             }
//         };
//     }
// })