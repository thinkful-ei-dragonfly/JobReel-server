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
}

module.exports = ContactService