const xss = require('xss')

const ResourcesService = {
  getResources(db, user_id){
    return db
    .from('resources')
    .select(
      'resource_id',
      'type',
      'title',
      'description',
      'date_added',
      'user_id'
    )
    .where('user_id', user_id)
  },

  getById(db, resource_id){
    return db
    .from('resources')
    .select('*')
    .where('resource_id', resource_id)
    .first()
  },

  serializeResource(resource){
    return {
      resource_id: resource.resource_id,
      type: resource.type,
      title: xss(resource.title),
      description: xss(resource.description),
      date_added: resource.date_added,
      user_id: resource.user_id
    }
  },
  insertResource(db, resource){
    return db
    .insert(resource)
    .into('resources')
    .returning('*')
    .then(([resource]) => resource)
  },
  deleteResource(db, resource_id){
    return db('resources')
    .where({ resource_id })
    .delete()
  }
}
module.exports = ResourcesService