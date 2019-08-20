const xss = require('xss')

const ContactService = {
  getContacts(db, user_id) {
    return db
      .from('contacts')
      .select(
        'contact_id',
        'contact_name',
        'job_title',
        'company',
        'email',
        'linkedin',
        'comments',
        'date_added',
        'connected',
        'user_id'
      )
      .where('user_id', user_id)
  },

  insertContact(db, newContact){
    return db
    .insert(newContact)
    .into('contacts')
    .returning('*')
    .then(([contact]) => contact)
  },
  getById(db, contact_id){
    return db
    .from('contacts')
    .select('*')
    .where('contact_id', contact_id)
    .first()
  },

  deleteContact(db, contact_id){
    return db('contacts')
    .where({ contact_id })
    .delete()
  },

  serializeContact(contact){
    return {
      contact_id: contact.contact_id,
      contact_name: xss(contact.contact_name),
      job_title: xss(contact.job_title),
      company: xss(contact.company),
      email: xss(contact.email),
      linkedin: contact.linkedin,
      comments: contact.comments,
      date_added: contact.date_added,
      connected: contact.connected,
      user_id: contact.user_id
    }
  }
}

module.exports = ContactService