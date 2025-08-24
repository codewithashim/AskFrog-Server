import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/askforge_db',
  username: process.env.MONGODB_USERNAME || '',
  password: process.env.MONGODB_PASSWORD || '',
  database: process.env.MONGODB_DATABASE || 'askforge_db',
  authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}));

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));

export const securityConfig = registerAs('security', () => ({
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
  rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,
}));

export const loggingConfig = registerAs('logging', () => ({
  level: process.env.LOG_LEVEL || 'info',
  filePath: process.env.LOG_FILE_PATH || 'logs',
}));

export const uploadConfig = registerAs('upload', () => ({
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
  uploadPath: process.env.UPLOAD_PATH || 'uploads',
}));

export const aiConfig = registerAs('ai', () => ({
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-pro',
}));

export const vectorStoreConfig = registerAs('vectorStore', () => ({
  pineconeApiKey: process.env.PINECONE_API_KEY || '',
  pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || 'us-east1-gcp',
  pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'askforge-embeddings',
}));
