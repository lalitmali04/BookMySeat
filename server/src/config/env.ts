import dotenv from 'dotenv';

dotenv.config();

const getEnvOrThrow = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is required.`);
  }

  return value;
};

export const config = {
  // Environment
  nodeEnv: getEnvOrThrow('NODE_ENV'),

  // Server
  port: parseInt(getEnvOrThrow('PORT'), 10),

  // JWT
  jwtSecret: getEnvOrThrow('JWT_SECRET'),
  jwtExpiresIn: getEnvOrThrow('JWT_EXPIRES_IN'),

  // Database
  databaseUrl: getEnvOrThrow('DATABASE_URL'),

  // Redis
  redisUrl: getEnvOrThrow('REDIS_URL'),

  // CORS
  corsOrigin: getEnvOrThrow('CLIENT_URL'),

  // Seat Lock
  lockTtlSeconds: parseInt(getEnvOrThrow('SEAT_LOCK_TTL'), 10),

  // Fees
  convenienceFeePercentage: parseFloat(
    getEnvOrThrow('CONVENIENCE_FEE_PERCENTAGE')
  ),

  gstPercentage: parseFloat(
    getEnvOrThrow('GST_PERCENTAGE')
  ),
};
