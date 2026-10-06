import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

const getEnvOrThrow = (key: string, defaultValue?: string) => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required.`);
  }
  return value;
};

export const config = {
  port: parseInt(process.env.PORT || '10000', 10),
  nodeEnv,
  jwtSecret: getEnvOrThrow('JWT_SECRET', nodeEnv === 'development' ? 'bookmyseat-dev-secret' : undefined),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: getEnvOrThrow('DATABASE_URL', nodeEnv === 'development' ? 'postgresql://postgres:postgres@localhost:5432/bookmyseat' : undefined),
  redisUrl: getEnvOrThrow('REDIS_URL', nodeEnv === 'development' ? 'redis://localhost:6379' : undefined),
  corsOrigin: getEnvOrThrow('CLIENT_URL', nodeEnv === 'development' ? 'http://localhost:5173' : undefined),
  lockTtlSeconds: parseInt(process.env.SEAT_LOCK_TTL || '300', 10), // 5 minutes default
  convenienceFeePercentage: 0.10, // 10%
  gstPercentage: 0.18, // 18% GST on convenience fee
};
