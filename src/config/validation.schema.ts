import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  // Database
  MONGODB_URI: Joi.string().default('mongodb://localhost:27017/askforge_db'),
  MONGODB_USERNAME: Joi.string().optional(),
  MONGODB_PASSWORD: Joi.string().optional(),
  MONGODB_DATABASE: Joi.string().default('askforge_db'),
  MONGODB_AUTH_SOURCE: Joi.string().default('admin'),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Security
  BCRYPT_ROUNDS: Joi.number().min(10).max(20).default(12),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_LIMIT: Joi.number().default(100),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  LOG_FILE_PATH: Joi.string().default('logs'),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // File Upload
  MAX_FILE_SIZE: Joi.number().default(10485760),
  UPLOAD_PATH: Joi.string().default('uploads'),

  // AI Configuration
  GEMINI_API_KEY: Joi.string().required(),
  GEMINI_MODEL: Joi.string().default('gemini-pro'),

  // Vector Store (Pinecone)
  PINECONE_API_KEY: Joi.string().required(),
  PINECONE_ENVIRONMENT: Joi.string().required(),
  PINECONE_INDEX_NAME: Joi.string().default('askforge-embeddings'),
});
