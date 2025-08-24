import { IsString, IsOptional, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { ChatbotType } from '../entities/chatbot.entity';

export class CreateChatbotDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ChatbotType)
  type?: ChatbotType;

  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @IsOptional()
  @IsObject()
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    fontFamily?: string;
  };

  @IsOptional()
  @IsObject()
  settings?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
    enableFileUpload?: boolean;
    enableVoiceInput?: boolean;
    enableAnalytics?: boolean;
  };

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
