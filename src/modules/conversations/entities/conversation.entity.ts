import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

@Schema({ collection: 'conversations', timestamps: true })
export class Conversation extends BaseEntity {
  @Prop({ maxlength: 255 })
  title?: string;

  @Prop({ 
    type: String, 
    enum: ConversationStatus, 
    default: ConversationStatus.ACTIVE 
  })
  status: ConversationStatus;

  @Prop()
  sessionId?: string;

  @Prop({ type: Object })
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    referrer?: string;
  };

  @Prop({ default: 0 })
  messageCount: number;

  @Prop()
  lastMessageAt?: Date;

  @Prop({ required: true, ref: 'User' })
  userId: string;

  @Prop({ required: true, ref: 'Chatbot' })
  chatbotId: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
