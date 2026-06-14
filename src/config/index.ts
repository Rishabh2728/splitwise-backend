export const config = {
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db'
};
