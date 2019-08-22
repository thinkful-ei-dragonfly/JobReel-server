const xss = require('xss')

const CompanyService = {
  getCompanies(db, user_id) {
    return db
      .from('companies')
      .select(
        'company_id',
        'company_name',
        'city',
        'state',
        'industry',
        'website',
        'description',
        'contact',
        'date_added',
        'user_id'
      )
      .where('user_id', user_id)
  },

  insertCompany(db, newCompany){
    return db
    .insert(newCompany)
    .into('companies')
    .returning('*')
    .then(([company]) => company)
  },

  getById(db, company_id){
    return db
    .from('companies')
    .select('*')
    .where('company_id', company_id)
    .first()
  },
  deleteCompany(db, company_id){
    return db('companies')
    .where({ company_id })
    .delete()
  },
  updateCompany(db, company_id, newJobFields){
    return db('companies')
    .where('company_id', company_id)
    .update(newJobFields)
  },
  serializeCompany(company){
    return {
      company_id: company.company_id,
      company_name: xss(company.company_name),
      city: xss(company.city),
      state: xss(company.state),
      industry: xss(company.industry),
      website: company.website,
      description: xss(company.description),
      contact: xss(company.contact),
      date_added: company.date_added,
      user_id: company.user_id
    }
  }
}

module.exports = CompanyService