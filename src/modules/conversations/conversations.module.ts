import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from './entities/conversation.entity';
import { Message, MessageSchema } from './entities/message.entity';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { AIModule } from '../ai/ai.module';
import { ChatbotsModule } from '../chatbots/chatbots.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    AIModule,
    ChatbotsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ConversationsModule {}
