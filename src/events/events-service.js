const xss = require('xss')

const EventsService = {
  getEvents(db, user_id) {
    return db
      .from('events')
      .select(
        'event_id',
        'event_name',
        'host',
        'city',
        'state',
        'address',
        'date',
        'url',
        'description',
        'status',
        'user_id'
      )
      .where('user_id', user_id)
  },
  insertEvent(db, event) {
    return db
      .insert(event)
      .into('events')
      .returning('*')
      .then(([event]) => event)
  },
  serializeEvent(event) {
    return {
      event_id: event.event_id,
      event_name: xss(event.event_name),
      host: xss(event.host),
      city: xss(event.city),
      state: xss(event.state),
      address: xss(event.address),
      date: event.date,
      url: event.url,
      description: xss(event.description),
      status: xss(event.status),
      user_id: event.user_id
    }
  },

  getById(db, id) {
    return db
      .from('events')
      .select('*')
      .where('event_id', id)
      .first()
  },

  deleteEvent(db, id) {
    return db('events')
      .where('event_id', id)
      .delete()
  },
  
  updateEvent(db, id, newEventFields) {
    return db('events')
      .where('event_id', id)
      .update(newEventFields)
  }

}

module.exports = EventsService