<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# AskForge Backend

A modular monolith NestJS backend for the AskForge chatbot platform, built with MongoDB and comprehensive error handling.

## 🏗️ Architecture

This project follows a **modular monolith** architecture with the following structure:

```
src/
├── config/                 # Configuration management
├── common/                 # Shared utilities and middleware
│   ├── entities/          # Base entities
│   ├── filters/           # Exception filters
│   ├── guards/            # Authentication guards
│   ├── interceptors/      # Response transformers
│   ├── decorators/        # Custom decorators
│   └── services/          # Shared services (logging)
├── database/              # Database configuration
├── modules/               # Feature modules
│   ├── auth/             # Authentication & authorization
│   ├── users/            # User management
│   ├── chatbots/         # Chatbot management
│   ├── knowledge-base/   # Knowledge base management
│   └── conversations/    # Chat conversations
└── main.ts               # Application entry point
```

## 🚀 Features

- **Modular Architecture**: Well-organized feature modules
- **MongoDB Integration**: Using Mongoose ODM
- **AI Integration**: Google Gemini for text generation and embeddings
- **Vector Store**: Pinecone for semantic search and RAG functionality
- **JWT Authentication**: Secure token-based authentication
- **Comprehensive Error Handling**: Global exception filters
- **Request Validation**: DTO-based validation with class-validator
- **Structured Logging**: Winston-based logging with file rotation
- **Rate Limiting**: Built-in request throttling
- **Security**: Helmet, CORS, and other security middleware
- **Environment Configuration**: Centralized config management
- **Soft Deletes**: Data preservation with soft delete functionality
- **RAG (Retrieval-Augmented Generation)**: Context-aware AI responses

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ask-forge-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Application
   NODE_ENV=development
   PORT=3000
   API_PREFIX=api/v1

   # Database
   MONGODB_URI=mongodb://localhost:27017/askforge_db
   MONGODB_USERNAME=
   MONGODB_PASSWORD=
   MONGODB_DATABASE=askforge_db
   MONGODB_AUTH_SOURCE=admin

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-minimum-32-characters
   JWT_REFRESH_EXPIRES_IN=30d

   # Security
   BCRYPT_ROUNDS=12
   RATE_LIMIT_TTL=60
   RATE_LIMIT_LIMIT=100

   # Logging
   LOG_LEVEL=info
   LOG_FILE_PATH=logs

   # CORS
   CORS_ORIGIN=http://localhost:3000

   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=uploads

   # Redis (for caching/sessions)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0

   # AI Configuration
   GEMINI_API_KEY=your-gemini-api-key-here
   GEMINI_MODEL=gemini-pro

   # Vector Store (Pinecone)
   PINECONE_API_KEY=your-pinecone-api-key-here
   PINECONE_ENVIRONMENT=us-east1-gcp
   PINECONE_INDEX_NAME=askforge-embeddings
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or using local MongoDB installation
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### User Management

- `GET /api/v1/users/profile` - Get current user profile
- `PATCH /api/v1/users/profile` - Update current user profile
- `GET /api/v1/users/:id` - Get user by ID (admin only)
- `PATCH /api/v1/users/:id` - Update user (admin only)
- `DELETE /api/v1/users/:id` - Delete user (admin only)

### Chatbot Management

- `POST /api/v1/chatbots` - Create new chatbot
- `GET /api/v1/chatbots` - Get user's chatbots
- `GET /api/v1/chatbots/:id` - Get specific chatbot
- `GET /api/v1/chatbots/public/:id` - Get public chatbot
- `PATCH /api/v1/chatbots/:id` - Update chatbot
- `PATCH /api/v1/chatbots/:id/status` - Update chatbot status
- `POST /api/v1/chatbots/:id/embed-code` - Generate embed code
- `DELETE /api/v1/chatbots/:id` - Delete chatbot

### Chat & Conversations

- `POST /api/v1/chat/send` - Send message and get AI response
- `GET /api/v1/chat/conversations` - Get user conversations
- `GET /api/v1/chat/conversations/:id/messages` - Get conversation messages
- `DELETE /api/v1/chat/conversations/:id` - Close conversation
- `DELETE /api/v1/chat/conversations/:id/delete` - Delete conversation

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run db:seed` - Run database seeds

## 🏛️ Database Schema

### Users Collection
- Basic user information (name, email, password)
- Role-based access control (admin, user, premium)
- Account status management
- Email verification tracking
- User preferences

### Chatbots Collection
- Chatbot configuration and settings
- Theme customization
- Embed code generation
- Usage statistics
- Public/private visibility

### Knowledge Base Collection
- Document storage and management
- File upload support
- Document processing status
- Embeddings for AI integration

### Conversations Collection
- Chat session management
- Message history
- User session tracking
- Analytics metadata

### Messages Collection
- Individual message storage
- Message types (text, file, audio, etc.)
- Processing metadata
- AI response tracking

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt with configurable rounds
- **Rate Limiting**: Request throttling to prevent abuse
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers middleware
- **Input Validation**: Comprehensive DTO validation
- **Soft Deletes**: Data preservation and audit trails

## 📊 Logging

The application uses Winston for structured logging with:
- Console and file output
- Daily log rotation
- Configurable log levels
- Request ID tracking
- Error stack traces

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t askforge-backend .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e MONGODB_URI=mongodb://host.docker.internal:27017/askforge_db \
     -e JWT_SECRET=your-secret-key \
     askforge-backend
   ```

### Environment Variables

Make sure to set the following environment variables in production:
- `NODE_ENV=production`
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Strong secret key (32+ characters)
- `JWT_REFRESH_SECRET` - Strong refresh secret key
- `CORS_ORIGIN` - Allowed frontend origin

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.
