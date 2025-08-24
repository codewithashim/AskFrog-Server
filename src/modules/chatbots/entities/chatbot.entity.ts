import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum ChatbotStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export enum ChatbotType {
  GENERAL = 'general',
  CUSTOMER_SUPPORT = 'customer_support',
  SALES = 'sales',
  EDUCATION = 'education',
  CUSTOM = 'custom',
}

@Schema({ collection: 'chatbots', timestamps: true })
export class Chatbot extends BaseEntity {
  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop()
  description?: string;

  @Prop({ 
    type: String, 
    enum: ChatbotStatus, 
    default: ChatbotStatus.DRAFT 
  })
  status: ChatbotStatus;

  @Prop({ 
    type: String, 
    enum: ChatbotType, 
    default: ChatbotType.GENERAL 
  })
  type: ChatbotType;

  @Prop()
  welcomeMessage?: string;

  @Prop({ type: Object })
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    fontFamily?: string;
  };

  @Prop({ type: Object })
  settings?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
    enableFileUpload?: boolean;
    enableVoiceInput?: boolean;
    enableAnalytics?: boolean;
  };

  @Prop()
  embedCode?: string;

  @Prop()
  publicUrl?: string;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: 0 })
  totalConversations: number;

  @Prop({ default: 0 })
  totalMessages: number;

  @Prop({ required: true, ref: 'User' })
  userId: string;
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot);
