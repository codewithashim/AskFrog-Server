import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
}

@Schema({ collection: 'messages', timestamps: true })
export class Message extends BaseEntity {
  @Prop({ required: true })
  content: string;

  @Prop({ 
    type: String, 
    enum: MessageRole, 
    required: true 
  })
  role: MessageRole;

  @Prop({ 
    type: String, 
    enum: MessageType, 
    default: MessageType.TEXT 
  })
  type: MessageType;

  @Prop({ 
    type: String, 
    enum: MessageStatus, 
    default: MessageStatus.SENT 
  })
  status: MessageStatus;

  @Prop({ type: Object })
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
    confidence?: number;
    intent?: string;
    entities?: any[];
  };

  @Prop()
  fileUrl?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  fileSize?: number;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop()
  editedAt?: Date;

  @Prop({ required: true, ref: 'Conversation' })
  conversationId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
