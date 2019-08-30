module.exports = {
  PORT: process.env.PORT || 8000,
  AUTHENTIC_JOBS_API_TOKEN: process.env.AUTHENTIC_JOBS_API_TOKEN,
  HUNTER_API_TOKEN: process.env.HUNTER_API_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  AUTHENTIC_JOBS_API_TOKEN: process.env.AUTHENTIC_JOBS_API_TOKEN,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DATABASE_URL || 'postgresql://dunder-mifflin@localhost/jobreel',
  TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://postgres@localhost/jobreel-test',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY
}