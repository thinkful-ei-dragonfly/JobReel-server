const knex = require('knex')
const config = require('../src/config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: config.TEST_DB_URL,
  })
}

function makeUsersArray() {
  return [
    {
      id: 1,
      email: 'user1@email.com',
      first_name: 'First1',
      last_name: 'Last1',
      username: 'user1',
      password: 'Password1!',
      city: 'city1',
      industry: 'industry1',
      job_title: 'job1'
    },
    {
      id: 2,
      email: 'user2@email.com',
      first_name: 'First2',
      last_name: 'Last2',
      username: 'user2',
      password: 'Password2!',
      city: 'city2',
      industry: 'industry2',
      job_title: 'job2'
    }
  ]
}

function expectedUsers(){
  return [
    {
      id: 1,
      email: 'user1@email.com',
      first_name: 'First1',
      last_name: 'Last1',
      username: 'user1',
      city: 'city1',
      industry: 'industry1',
      job_title: 'job1'
    },
    {
      id: 2,
      email: 'user2@email.com',
      first_name: 'First2',
      last_name: 'Last2',
      username: 'user2',
      city: 'city2',
      industry: 'industry2',
      job_title: 'job2'
    }
  ]
}

function makeMaliciousUser() {
  const maliciousUser = {
    id: 911,
    email: `email@email.com <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`,
    first_name: `First <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`,
    last_name: `Last <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`,
    username: `username <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`,
    password: 'Password1!'
  }

  const expectedUser = {
    ...maliciousUser,
    email: `email@email.com <img src="https://url.to.file.which/does-not.exist">`,
    first_name: `First <img src="https://url.to.file.which/does-not.exist">`,
    last_name: `Last <img src="https://url.to.file.which/does-not.exist">`,
    username: `username <img src="https://url.to.file.which/does-not.exist">`,
  }
  return {
    maliciousUser,
    expectedUser,
  }
}

function makeMaliciousEvent() {
  const maliciousEvent = {
    event_id: 1,
    event_name: 'Event 1 <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    host: 'Host 1 <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    city: 'City1 <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    state: 'State1 <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    address: 'Address 1 <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    date: '2019-07-03T19:26:38.918Z',
    url: 'http://event1.com',
    description: 'Description for Event 1 <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    status: 'Will attend <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    user_id: 1
  }

  const expectedEvent = {
    ...maliciousEvent,
    event_name: 'Event 1 <img src="https://url.to.file.which/does-not.exist">',
    host: 'Host 1 <img src="https://url.to.file.which/does-not.exist">',
    city: 'City1 <img src="https://url.to.file.which/does-not.exist">',
    state: 'State1 <img src="https://url.to.file.which/does-not.exist">',
    address: 'Address 1 <img src="https://url.to.file.which/does-not.exist">',
    description: 'Description for Event 1 <img src="https://url.to.file.which/does-not.exist">',
    status: 'Will attend <img src="https://url.to.file.which/does-not.exist">',
  }
  return {
    maliciousEvent,
    expectedEvent
  }
}

function makeMaliciousResource() {
  const maliciousResource = {
    resource_id: 1,
    type: 'website',
    title: 'Resource 1 <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    description: 'Description for resource 1 <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    date_added: '2019-07-03T19:26:38.918Z',
    user_id: 1
  }

  const expectedResource = {
    ...maliciousResource,
    title: 'Resource 1 <img src="https://url.to.file.which/does-not.exist">',
    description: 'Description for resource 1 <img src="https://url.to.file.which/does-not.exist">'
  }
  return {
    maliciousResource,
    expectedResource
  }
}

function makeJobsArray() {
  return [
    {
      job_id: 1,
      user_id: 1,
      job_title: 'Engineer',
      company: 'Company A',
      city: 'New York City',
      state: 'NY',
      date_added: '2019-08-14T17:18:19.306Z',
      url: 'http://www.thinkful.com',
      description: 'Engineering job',
      status: 'Interested',
      date_applied: '2019-08-16T17:18:19.306Z',
      notification: true
    },
    {
      job_id: 2,
      user_id: 1,
      job_title: 'UI Designer',
      company: 'Company B',
      city: 'Austin',
      state: 'TX',
      date_added: '2019-08-14T17:18:19.306Z',
      url: 'http://www.google.com',
      description: 'UI job',
      status: 'Interested',
      date_applied: null,
      notification: true
    }
  ]
}

function makeEventsArray() {
  return [
    {
      event_id: 1,
      event_name: 'Event 1',
      host: 'Host 1',
      city: 'City1',
      state: 'State1',
      address: 'Address 1',
      date: '2019-07-03T19:26:38.918Z',
      url: 'http://event1.com',
      description: 'Description for Event 1',
      status: 'Will attend',
      user_id: 1
    },
    {
      event_id: 2,
      event_name: 'Event 2',
      host: 'Host 2',
      city: 'City2',
      state: 'State2',
      address: 'Address 2',
      date: '2019-07-03T19:26:38.918Z',
      url: 'http://event2.com',
      description: 'Description for Event 2',
      status: 'Interested',
      user_id: 2
    }
  ]
}

function makeContactsArray() {
  return [
    {
      contact_id: 1,
      contact_name: 'Contact 1',
      job_title: 'Engineer',
      company: 'Company1',
      email: 'email@email.com',
      linkedin: 'http://www.linkedin.com/person1',
      comments: 'Contact 1 comments',
      date_added: '2019-07-03T19:26:38.918Z',
      connected: false,
      user_id: 1,
      date_connected: '2019-07-16T17:18:19.306Z',
      notification: true
    },
    {
      contact_id: 2,
      contact_name: 'Contact 2',
      job_title: 'Analyst',
      company: 'Company2',
      email: 'email2@email.com',
      linkedin: 'http://www.linkedin.com/person2',
      comments: 'Contact 2 comments',
      date_added: '2019-07-03T19:26:38.918Z',
      connected: true,
      user_id: 2,
      date_connected: null,
      notification: true
    }
  ]
}

function makeCompaniesArray(){
  return [
    {
      company_id: 1,
      company_name: 'Company 1',
      city: 'City',
      state: 'AZ',
      industry: 'Tech',
      website: 'http://www.company.com/company1',
      description: 'Company 1 Description',
      contact: 'Contact 1',
      date_added: '2019-07-03T19:26:38.918Z',
      user_id: 1
    },
    {
      company_id: 2,
      company_name: 'Company 2',
      city: 'City',
      state: 'FL',
      industry: 'Auto',
      website: 'http://www.company.com/company2',
      description: 'Company 2 Description',
      contact: 'Contact 2',
      date_added: '2019-07-03T19:26:38.918Z',
      user_id: 1
    }
  ]
}

function makeResourcesArray() {
  return [
    {
      resource_id: 1,
      type: 'website',
      title: 'Resource 1',
      description: 'Description for resource 1',
      date_added: '2019-07-03T19:26:38.918Z',
      user_id: 1
    },
    {
      resource_id: 2,
      type: 'book',
      title: 'Resource 2',
      description: 'Description for resource 2',
      date_added: '2019-07-03T19:26:38.918Z',
      user_id: 2
    }
  ]
}

function makeExpectedAuthenticJobs() {
  return [{
    id: '31540',
    title: 'Lead UX Designer',
    description:
      '<p><div class="apply-container" style="box-sizing: border-box; margin: 0px; padding: 0px; border: 0px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-weight: 400; font-stretch: inherit; font-size: medium; line-height: inherit; font-family: Roboto, HelveticaNeue-Light, \'Helvetica Neue Light\', \'Helvetica Neue\', Helvetica, Arial; vertical-align: baseline; color: #333333; letter-spacing: 0.5px; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: #ffffff; text-decoration-style: initial; text-decoration-color: initial;">&nbsp;</div>\n<div class="description" style="box-sizing: border-box; margin: 0px 0px 40px; padding: 0px; border: 0px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-weight: 400; font-stretch: inherit; font-size: medium; line-height: inherit; font-family: Roboto, HelveticaNeue-Light, \'Helvetica Neue Light\', \'Helvetica Neue\', Helvetica, Arial; vertical-align: baseline; width: 550px; color: #444444; letter-spacing: 0.5px; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: #ffffff; text-decoration-style: initial; text-decoration-color: initial;">\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">Do you love complex problems, helping people find innovative product solutions, and making it seem simple to the end-user? Uniform Teeth has an extraordinary opportunity for you! We are searching for a Lead UX Designer to join our Product Team in San Francisco. The Product Team partners creatively and strategically with a cross-functional team of product managers, marketers, engineers, data analysts, and designers to improve both patient and staff experience with Uniform Teeth.</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">&nbsp;</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">In This Role You&rsquo;ll Have The Opportunity To:</p>\n<ul style="box-sizing: border-box; margin: 0px 0px 40px 20px; padding: 0px; border: 0px; font: inherit; vertical-align: baseline; list-style: disc;">\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">Lead the design work across our core web user experiences</li>\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">With your cross-functional team, develop a keen understanding of our potential users and their needs&ndash;whether through user research, workshopping, or sketching/visualization</li>\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">From this understanding, you\'ll design experiences to delight patients and Uniform Teeth staff alike while achieving both stakeholders&rsquo; goals</li>\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">Use data to drive and inform design across the patient journey.</li>\n</ul>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">&nbsp;</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">What You\'ll Bring:</p>\n<ul style="box-sizing: border-box; margin: 0px 0px 40px 20px; padding: 0px; border: 0px; font: inherit; vertical-align: baseline; list-style: disc;">\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">2+ years experience participating in the complete product development lifecycle of web and/or software applications as a UX or product designer</li>\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">A stunning portfolio of your work demonstrating your experience in product design</li>\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">Gather and evaluate user requirements in collaboration with product managers and engineers</li>\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">Produce prototypes, storyboards, process flows and sitemaps to articulate functionality and user experience</li>\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">Present cohesive design approaches to a non-design audience (including business, product, and technology teams)</li>\n<li style="box-sizing: border-box; margin: 0px 0px 10px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">Bonus if you&rsquo;ve done any of the following\n<ul style="box-sizing: border-box; margin: 0px 0px 0px 20px; padding: 0px; border: 0px; font: inherit; vertical-align: baseline; list-style: disc;">\n<li style="box-sizing: border-box; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">Designed dashboards or analytics that present large amounts of information in a simple and digestible manner</li>\n<li style="box-sizing: border-box; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline;">Worked on medical software projects i.e. insurance billing/eligibility checks, EMR, doctor referrals, etc.</li>\n</ul>\n</li>\n</ul>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">&nbsp;</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">This is a full-time position based in San Francisco, CA.</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">&nbsp;</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">About Uniform Teeth</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">We believe that straight teeth have the power to transform lives by improving health and confidence.</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">At Uniform Teeth, we&rsquo;re on a mission to make access to high-quality orthodontic care easier and more affordable. Our proprietary use of 3D technology can cut down treatment times from years to months. And, our app allows consumers to track their journey and get immediate support from our trained staff and a team of UCSF doctors.</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">Over the next two years, we will be scaling rapidly and we&rsquo;ll do this with an amazing team with experience from Twitter, One Medical Group, Zipcar, UCSF, and Harvard. And our investors believe in our mission. They&rsquo;ve also invested in Allbirds, Casper, Warby Parker, and Airbnb.</p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">Learn more about us out at&nbsp;<a style="box-sizing: border-box; background: 0px 0px; color: #444444; text-decoration: underline; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 400; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; vertical-align: baseline;" href="https://www.uniformteeth.com/">uniformteeth.com</a></p>\n<p style="box-sizing: border-box; margin: 0px 0px 20px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 300; font-stretch: inherit; font-size: inherit; line-height: 1.7; font-family: inherit; vertical-align: baseline; text-rendering: optimizelegibility;">Read about us at in&nbsp;<a style="box-sizing: border-box; background: 0px 0px; color: #444444; text-decoration: underline; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: 400; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; vertical-align: baseline;" href="https://techcrunch.com/2018/05/07/i-visited-a-teeth-straightening-startup-and-found-out-i-needed-a-root-canal/">TechCrunch</a></p>\n</div></p>',
    perks:
      'What We\'ll Bring:\n\nCompetitive medical, dental, and vision coverage\n401(k)\nOpportunity for growth as the company expands\nFree orthodontic treatment after 90 days of employment',
    howto_apply: '',
    post_date: '2019-08-07 14:55:35',
    relocation_assistance: 0,
    telecommuting: 0,
    category: { id: '3', name: 'Design &amp; User Experience' },
    type: { id: '1', name: 'Full-time' },
    company:
    {
      id: 'uniformteeth',
      name: 'Uniform Teeth',
      url: 'http://uniformteeth.com',
      type: null,
      location: {
        "id": "sanfranciscoca",
        "name": "San Francisco, CA"
      }
      ,
      logo:
        'https://d2fcz5no062gar.cloudfront.nethttps://authenticjobs.s3.amazonaws.com/uploads/logos/5ec13120aec854e523389a875c755eb4/thumb/uniformteeth.jpeg',
      tagline: 'Come work with us!'
    },
    keywords:
      'product,team,uniform,experience,design,teeth,user,your,staff,years,from,ucsf,patient,have,work,lead,across,managers,technology,their,youll,mission,believe,software,medical,designer,data,understanding,crossfunctional,francisco',
    apply_url:
      'https://uniformteeth.breezy.hr/p/72e02aa23839-lead-ux-designer?source=authenticjobs',
    url: 'https://authenticjobs.com/jobs/31540/lead-ux-designer'
  }]
}

function makeExpectedGitHubJobs() {
  return [
    {
      company: "Motive Interactive",
      company_logo: null,
      company_url: null,
      created_at: "Mon Aug 19 19:11:51 UTC 2019",
      description: `<p>About Motive</p>\n<p>Motive Interactive is one of the Top Mobile Ad Networks in the world, come join a team with an amazing future. Motive has been recognized by numerous publications including Inc. Magazine as one of the fastest growing companies in the United States. Motive is at the forefront of the Mobile Ad Technology industry and a proven leader in user acquisition for apps.</p>\n<p>We are seeking a Senior Software Engineer who can drive technical growth through design and implementation of distributed, high-availability systems. Candidates for this role demonstrate excellent technical acumen and can propose solutions to overcome technical challenges.</p>\n<p>Responsibilities</p>\n<ul>\n<li>\n<p>Interface with engineers, business stakeholders and analysts to inform decisions about product design and implementation</p>\n</li>\n<li>\n<p>Develop and maintain real-time, high-availability distributed systems</p>\n</li>\n<li>\n<p>Work with data team to launch new models into production infrastructure</p>\n</li>\n<li>\n<p>Support existing processes running in production</p>\n</li>\n<li>\n<p>Offer technical solutions to challenges encountered by engineering team</p>\n</li>\n</ul>\n<p>Requirements</p>\n<ul>\n<li>\n<p>At least 5 years of production experience</p>\n</li>\n<li>\n<p>Proficiency in Golang</p>\n</li>\n<li>\n<p>Strong algorithm design skills</p>\n</li>\n<li>\n<p>Profiling and code optimization skills</p>\n</li>\n<li>\n<p>Distributed Systems theory (replication, consistency levels, sharding)</p>\n</li>\n<li>\n<p>Knowledge of distributed database technologies</p>\n</li>\n<li>\n<p>AWS (EC2, ELB/ALB, Auto-scaling, S3)</p>\n</li>\n<li>\n<p>Experience implementing machine learning models in scaled, production environments</p>\n</li>\n<li>\n<p>Exceptional debugging skills</p>\n</li>\n</ul>\n<p>Bonus Points</p>\n<ul>\n<li>\n<p>Basic understanding of display/mobile advertising technology</p>\n</li>\n<li>\n<p>Experience with developing in containerized infrastructure (Docker / Kubernetes)</p>\n</li>\n<li>\n<p>Experience building low-latency systems</p>\n</li>\n<li>\n<p>Familiarity with less common AWS services (Redshift, Lambda)</p>\n</li>\n<li>\n<p>Experience with pub-sub systems like Kafka and Kinesis</p>\n</li>\n<li>\n<p>JavaScript / Typescript</p>\n</li>\n<li>\n<p>Familiarity with various AWS pricing models</p>\n</li>\n</ul>\n<p>Perks</p>\n<ul>\n<li>\n<p>Competitive base salary</p>\n</li>\n<li>\n<p>Profit from working with a team on the cutting edge of the mobile marketing and ad tech industry.</p>\n</li>\n<li>\n<p>A company recognized for its amazing Culture! Ranked as one of San Diego's best places to work</p>\n</li>\n<li>\n<p>Casual relaxed atmosphere with a results-driven mentality</p>\n</li>\n<li>\n<p>Health benefits: Medical/dental/vision benefits</p>\n</li>\n<li>\n<p>401K</p>\n</li>\n</ul>\n`,
      how_to_apply: `<p><a href=\"https://jsco.re/31gtn\">https://jsco.re/31gtn</a></p>\n`,
      id: "b78cba9d-001c-4de5-b85e-5bb200ee4f7d",
      location: "San Diego, CA, US",
      title: "Senior Software Engineer",
      type: "Full Time",
      url: "https://jobs.github.com/positions/b78cba9d-001c-4de5-b85e-5bb200ee4f7d",
    }
  ]
}

function makeJobsFixtures() {
  const testUsers = makeUsersArray()
  const expectedAuthenticJobs = makeExpectedAuthenticJobs()
  const expectedGitHubJobs = makeExpectedGitHubJobs()
  return { testUsers, expectedAuthenticJobs, expectedGitHubJobs }
}

// function cleanTables(db) {
//   return db.raw(
//     `TRUNCATE
//       lemonstand_users,
//       saved_recipes,
//       user_recipes
//       RESTART IDENTITY CASCADE`
//   )
// }


function makeAuthHeader(user, secret = process.env.JWT_SECRET){
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      companies,
      contacts,
      jobs,
      users
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
}

function seedEvents(db, users, events) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('events').insert(events)
  })
}

function seedJobs(db, users, jobs) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('jobs').insert(jobs)
  })
}

function seedContacts(db, users, contacts) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('contacts').insert(contacts)
  })
}

function seedCompanies(db, users, companies) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('companies').insert(companies)
  })
}

function seedResources(db, users, resources) {
  // return db.into('resources').insert(resources)
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('resources').insert(resources)
  })
}

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeMaliciousUser,
  makeMaliciousEvent,
  makeMaliciousResource,
  makeJobsArray,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  seedEvents,
  seedJobs,
  seedContacts,
  seedCompanies,
  seedResources,
  makeEventsArray,
  makeContactsArray,
  makeResourcesArray,
  makeExpectedAuthenticJobs,
  makeExpectedGitHubJobs,
  makeJobsFixtures,
  makeCompaniesArray,
  makeResourcesArray,
  expectedUsers
}

