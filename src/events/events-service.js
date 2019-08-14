const EventsService = {
  getEvents(knex, user_id){
    return knex
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
  }
}

module.exports = EventsService