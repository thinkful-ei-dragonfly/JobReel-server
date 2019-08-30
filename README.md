# JobReel Server

## Tech Stack 

  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^8.0.0",
    "express": "^4.17.1",
    "helmet": "^3.18.0",
    "jsonwebtoken": "^8.5.1",
    "knex": "^0.19.1",
    "morgan": "^1.9.1",
    "path": "^0.12.7",
    "pg": "^7.12.1",
    "unirest": "^0.6.0",
    "xss": "^1.0.6"
  },
  "devDependencies": {
    "chai": "^4.2.0",
    "mocha": "^6.2.0",
    "nodemon": "^1.19.1",
    "postgrator-cli": "^3.1.0",
    "supertest": "^4.0.2"
  }

This app is written using Node.js and Express.

Authentiation and user endpoints relies on jsonwebtoken and bcryptjs--with sanitization being handled by xss. 

The database is written with the assitance of postgresql. 

Testing frameworks used are; mocha, chai, and supertest. 

External API's are Authentic Jobs API, Github Jobs API, EventBrite API, and Hunter.io API. 
Unirest was used in the communicating with all external api's. 

## Local dev setup

Complete the following steps to start a new project (NEW-PROJECT-NAME):

### Part One

1. Clone this repository to your local machine
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

### Part Two

1. Create a local .env.
2. Create a local database called jobreel and a test db called jobreel-test and assign the appropriate env variables related to said databases. 
3. Create and place a JWT auth token in the env for the purpose of the auth endpoints
4. Obtain API credentials for Authentic Jobs API and Github Jobs API for the jobs route, Hunter.io on the findcontacts route, and Eventbrite on the eventbrite route. Place credentials in the appropriatee variables in the env. 
5. Run migrations and seeds for the databasese. 
6. Run all tests to check they are passing. 

### Part Three

Connect to JobReel Client 

## Route Breakdown 

1. Auth: Handles authentification with regards to user logins. 
2. Companies: DB endpoint for saved companies. 
3. Contacts: DB endpoint related to saved contacts. 
4. Eventbrite: External eventbrite api endpoint. Handles OAUTH2 authentication for eventbrite api and related get requests which are handled which are accepted from the client as posts and handled with unirest as get and post requests. 
5. Events: DB endpoint for saved events related to eventbrite api. 
6. Findcontacts: External hunter.io api endpiont. Handles requests for professional emails based on search criteria. 
7. Jobs: External authentic and github jobs endpoint which makes requests for jobs based on location, keyword, and city. 
8. Middleware: JWT-auth middleware. 
9. Resources: Stored resources such as books or url's.
10. Savedjobs: DB endpoint related to the external jobs api. 
11. Users: Endpoint for newly registering users. 

## Local dev setup

For using example psql role `example-user`:

```bash
mv example.env .env
createdb -U example-user jobreel
createdb -U example-user jobreel-test
```

If your `example-user` user has a password be sure to set it in `.env` for all appropriate fields. Or if using a different user, update appropriately.

```bash
npm install
npm run migrate
env MIGRATION_DB_NAME=jobreel-test npm run migrate
```

## Configuring Postgres

For tests involving time to run properly, configure your Postgres database to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   1. E.g. for an OS X, Homebrew install: `/usr/local/var/postgres/postgresql.conf`
   2. E.g. on Windows, _maybe_: `C:\Program Files\PostgreSQL\11.2\data\postgresql.conf`
   3. E.g  on Ubuntu 18.04 probably: '/etc/postgresql/10/main/postgresql.conf'
2. Find the `timezone` line and set it to `UTC`:

```conf
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```


## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests mode `npm test`

Run the migrations up `npm run migrate`

Run the migrations down `npm run migrate -- 0`

