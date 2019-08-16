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
    },
    {
      id: 2,
      email: 'user2@email.com',
      first_name: 'First2',
      last_name: 'Last2',
      username: 'user2',
      password: 'Password2!',
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
      date_added: "2019-08-14T17:18:19.306Z",
      url: 'http://www.thinkful.com',
      description: 'Engineering job',
      status: 'Interested',
    },
    {
      job_id: 2,
      user_id: 1,
      job_title: 'UI Designer',
      company: 'Company B',
      city: 'Austin',
      state: 'TX',
      date_added: "2019-08-14T17:18:19.306Z",
      url: 'http://www.google.com',
      description: 'UI job',
      status: 'Interested',

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
      user_id: 1
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
      user_id: 2
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
      location: [Object],
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
  return [{
    id: '5dcf782d-5651-481c-9952-e8ee32758d7f',
    type: 'Full Time',
    url:
      'https://jobs.github.com/positions/5dcf782d-5651-481c-9952-e8ee32758d7f',
    created_at: 'Sun Jul 28 16:07:50 UTC 2019',
    company: 'leadPops, Inc.',
    company_url: 'https://leadPops.com',
    location: 'San Diego',
    title: 'Seeking Senior LAMP / FULL-STACK DEVELOPER',
    description:
      '<p>We are seeking a strong, experienced full-stack web developer to join our growing development team.</p>\n<p>To be clear, we\'re looking for both strong back-end development skills/experience and strong front-end development skills/experience.</p>\n<p>Working remote is an option, but the right candidate definitely needs to be located in the US -- ideally in San Diego, CA -- or Pacific or Central Time zone.</p>\n<p>WE ARE NOT CONSIDERING CANDIDATES OUTSIDE OF THE U.S. AT THIS TIME. IF OUTSIDE OF U.S., PLEASE DO NOT APPLY.</p>\n<p>Requiring a MINIMUM of 5 years’ web programming experience (preferred 7+ years), working full-time with a team, in the primary languages and frameworks we\'re on -- LAMP (Zend) &amp; Javascript.</p>\n<p>Experience in developing SaaS products is a plus.</p>\n<p>Seeking an individual that’s interested to work on challenging and rewarding projects. Great attitude is a must!</p>\n<p>The ideal candidate is a problem-solver, team-player, and eager to learn (and teach) the team new skills.</p>\n<p>Quality code and speed to deliver a great finished product and meet deadlines is crucial.</p>\n<p>Must be able to follow directions with excellent attention to detail.</p>\n<p>Ongoing training is provided, and you will be reporting directly to your team leaders in San Diego.</p>\n<p>Need to be able to work 40+ hours per week, remote or at the office.</p>\n<p>We use Slack and Zoom for interoffice communication with remote team members and developers.</p>\n<p>We follow Scrum and Agile methodology.</p>\n<p>We are offering a fixed monthly salary and bonuses. Salary offered will be based on experience.</p>\n<p>We also have a fun work environment and culture, plus benefits -- including health, dental, and 401K, and an awesome line of digital products and services that we continue to make even more awesome by the day.</p>\n<p>That\'s the stuff you\'re going to be working on.</p>\n<p>Our clients love us too -- approaching 100 5-star Google reviews with a 5.0 star rating. This makes building and selling our products and services that much more rewarding!</p>\n<p>The following skills are required for the position:</p>\n<ul>\n<li>PHP5</li>\n<li>Javascript</li>\n<li>Zend</li>\n<li>JSON</li>\n<li>CSS3</li>\n<li>HTML</li>\n<li>HTML5</li>\n<li>XML</li>\n<li>MySQL</li>\n<li>Jquery</li>\n<li>Responsive Coding</li>\n</ul>\n<p>The following are not required for the position, but a plus:</p>\n<ul>\n<li>PHP7</li>\n<li>Wordpress Development</li>\n<li>Wordpress Plugin Development</li>\n<li>Single Page Application Development</li>\n<li>Bootstrap</li>\n<li>Restful API</li>\n<li>Laravel</li>\n<li>VueJS</li>\n</ul>\n<p>Tools include:</p>\n<ul>\n<li>BitBucket</li>\n<li>Git</li>\n<li>Jira</li>\n</ul>\n<p>If this sounds like the right fit for you and your skill set, please inquire for a 1:1 interview with our team.</p>\n<p>We will be checking 2-3 references, and giving interested candidates 1-2 “tests” to verify skills and experience.</p>\n<p>We look forward to hearing from you!</p>\n',
    how_to_apply:
      '<p>Send your resume to <a href="mailto:andrew@leadpops.com">andrew@leadpops.com</a></p>\n<p>Also please send your LinkedIn profile link</p>\n<p>Also, any portfolio and/or code samples you can share.</p>\n<p>Thanks!</p>\n<p>-ap</p>\n',
    company_logo:
      'https://jobs.github.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcnh0IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--212e8563ba79c80de0d2310c10aac9e10d51a1ae/leadpops-NEW-logo%20LIGHT.png'
  }]
}

function makeJobsFixtures() {
  const testUsers = makeUsersArray()
  const expectedAuthenticJobs = makeExpectedAuthenticJobs()
  const expectedGitHubJobs = makeExpectedGitHubJobs()
  return { testUsers, expectedAuthenticJobs, expectedGitHubJobs }
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      lemonstand_users,
      saved_recipes,
      user_recipes
      RESTART IDENTITY CASCADE`
  )
}


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
  // return db.into('events').insert(events)
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

function seedResources(db, resources) {
  return db.into('resources').insert(resources)
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
  makeResourcesArray
}

