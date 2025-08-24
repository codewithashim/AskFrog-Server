import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get('database.uri');
        const username = configService.get('database.username');
        const password = configService.get('database.password');
        const authSource = configService.get('database.authSource');

        let connectionString = uri;

        if (username && password) {
          const url = new URL(uri);
          url.username = username;
          url.password = password;
          url.searchParams.set('authSource', authSource);
          connectionString = url.toString();
        }

        return {
          uri: connectionString,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              console.log('MongoDB connected successfully');
            });
            connection.on('error', (error) => {
              console.error('MongoDB connection error:', error);
            });
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
