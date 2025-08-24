import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotsService } from './chatbots.service';
import { ChatbotsController } from './chatbots.controller';
import { Chatbot, ChatbotSchema } from './entities/chatbot.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Chatbot.name, schema: ChatbotSchema }])],
  controllers: [ChatbotsController],
  providers: [ChatbotsService],
  exports: [ChatbotsService],
})
export class ChatbotsModule {}
