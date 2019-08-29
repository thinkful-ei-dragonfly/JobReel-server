const xss = require('xss')
const bcrypt = require('bcryptjs')

const UsersService = {
 
  hasUserWithUserName(db, username){
    return db('users')
    .where({ username })
    .first()
    .then(user => !!user)
  },
  hasOtherUserWithUserName(db, username, id){
    return db('users')
    .where({ username })
    .first()
    .then(user => {
      if (user && user.id === parseInt(id)) {
        return false;
      }
      return !!user
    })
  },
  hasUserWithEmail(db, email){
    return db('users')
    .where({ email })
    .first()
    .then(user => !!user)
  },
  hasOtherUserWithEmail(db, email, id){
    return db('users')
    .where({ email })
    .first()
    .then(user => {
      if (user && user.id === parseInt(id)) {
        return false;
      }
      return !!user
    })
  },
  insertUser(db, newUser){
    return db
    .insert(newUser)
    .into('users')
    .returning('*')
    .then(([user]) => user)
  },
  hashPassword(password){
    return bcrypt.hash(password, 12)
  },
  getById(db, id){
    return db
    .from('users')
    .select('*')
    .where('id', id)
    .first()
  },
  deleteUser(db, id){
    return db('users')
    .where({ id })
    .delete()
  },
  updateUser(db, id, newUserFields){
    return db('users')
    .where('id', id)
    .update(newUserFields)
  },
  serializeUser(user){
    return {
      id: user.id,
      email: xss(user.email),
      first_name: xss(user.first_name), 
      last_name: xss(user.last_name), 
      username: xss(user.username),
      city: xss(user.city),
      industry: xss(user.industry),
      job_title: xss(user.job_title),
    }
  }
}

module.exports = UsersService