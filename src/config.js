module.exports = {
  PORT: process.env.PORT || 8000,
  AUTHENTIC_JOBS_API_TOKEN: process.env.AUTHENTIC_JOBS_API_TOKEN || 'c66f726164668b130ad1f770accfd159',
  HUNTER_API_TOKEN: process.env.HUNTER_API_TOKEN || '080c905969f603dec1fb23ccde7210421835f6f0',
  CLIENT_ID: process.env.CLIENT_ID || 'I6MVEHHYVS3LD42Z46',
  CLIENT_SECRET: process.env.CLIENT_SECRET || 'V5MDVXPPD7JY5HNODIESMFVP32R63FXOCQS3ONC276SNQQTYBQ',
  AUTHENTIC_JOBS_API_TOKEN: process.env.AUTHENTIC_JOBS_API_TOKEN || 'c66f726164668b130ad1f770accfd159',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DATABASE_URL || 'postgresql://dunder-mifflin@localhost/jobreel',
  TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://postgres@localhost/jobreel-test',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h'
}