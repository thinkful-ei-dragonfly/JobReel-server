const xss = require('xss')

const JobService = {
  getJobs(db, user_id) {
    return db
      .from('jobs')
      .select(
        'job_id',
        'job_title',
        'company',
        'city',
        'state',
        'date_added',
        'url',
        'description',
        'status',
        'date_applied',
        'notification',
        'user_id'
      )
      .where('user_id', user_id)
  },

  getById(db, job_id) {
    return db
      .from('jobs')
      .select('*')
      .where('job_id', job_id)
      .first()
  },

  insertJob(db, newJob) {
    return db
      .insert(newJob)
      .into('jobs')
      .returning('*')
      .then(([job]) => job)
  },

  deleteJob(db, job_id) {
    return db('jobs')
      .where({ job_id })
      .delete()
  },

  updateJob(db, job_id, newJobFields) {
    return db('jobs')
      .where('job_id', job_id)
      .update(newJobFields)
  },

  serializeJob(job) {
    return {
      job_id: job.job_id,
      job_title: xss(job.job_title),
      company: xss(job.company),
      city: xss(job.city),
      state: xss(job.state),
      date_added: job.date_added,
      url: job.url,
      description: xss(job.description),
      status: job.status,
      date_applied: job.date_applied,
      notification: job.notification,
      user_id: job.user_id
    }
  }

}

module.exports = JobService