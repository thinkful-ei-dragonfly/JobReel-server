const xss = require('xss')
const bcrypt = require('bcryptjs')

const UsersService = {
 
  hasUserWithUserName(db, username){
    return db('users')
    .where({ username })
    .first()
    .then(user => !!user)
  },
  hasUserWithEmail(db, email){
    return db('users')
    .where({ email })
    .first()
    .then(user => !!user)
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
  updateUser(db, id, newJobFields){
    return db('users')
    .where('id', id)
    .update(newJobFields)
  },
  serializeUser(user){
    return {
      id: user.id,
      email: xss(user.email),
      first_name: xss(user.first_name), 
      last_name: xss(user.last_name), 
      username: xss(user.username)
    }
  }
}

module.exports = UsersService