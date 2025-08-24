import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationStatus,
} from '../entities/conversation.entity';
import {
  Message,
  MessageRole,
  MessageStatus,
} from '../entities/message.entity';
import {
  AIOrchestratorService,
  RAGResponse,
} from '../../ai/services/ai-orchestrator.service';
import { ChatbotsService } from '../../chatbots/chatbots.service';

export interface SendMessageDto {
  conversationId: string;
  content: string;
  userId: string;
  chatbotId: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  message: Message;
  aiResponse: RAGResponse;
  conversation: Conversation;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly aiOrchestrator: AIOrchestratorService,
    private readonly chatbotsService: ChatbotsService,
  ) {}

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    sendMessageDto: SendMessageDto,
  ): Promise<SendMessageResponse> {
    try {
      // Get or create conversation
      let conversation = await this.getOrCreateConversation(
        sendMessageDto.conversationId,
        sendMessageDto.userId,
        sendMessageDto.chatbotId,
        sendMessageDto.sessionId,
      );

      // Save user message
      const userMessage = await this.saveMessage({
        conversationId: (conversation as any)._id.toString(),
        content: sendMessageDto.content,
        role: MessageRole.USER,
        status: MessageStatus.SENT,
      });

      // Get chatbot settings
      const chatbot = await this.chatbotsService.findOne(
        sendMessageDto.chatbotId,
        sendMessageDto.userId,
      );

      // Generate AI response using RAG
      const aiResponse = await this.aiOrchestrator.chatWithContext(
        (conversation as any)._id.toString(),
        sendMessageDto.content,
        {
          chatbotId: sendMessageDto.chatbotId,
          userId: sendMessageDto.userId,
          namespace: `chatbot_${sendMessageDto.chatbotId}`,
          topK: chatbot.settings?.maxTokens ? 3 : 5,
        },
      );

      // Save AI response
      const aiMessage = await this.saveMessage({
        conversationId: (conversation as any)._id.toString(),
        content: aiResponse.answer,
        role: MessageRole.ASSISTANT,
        status: MessageStatus.SENT,
        metadata: {
          tokens: aiResponse.usage.totalTokens,
          model: 'gemini-pro',
          processingTime: Date.now(),
          sources: aiResponse.sources.length,
        },
      });

      // Update conversation
      conversation = await this.updateConversation(
        (conversation as any)._id.toString(),
        {
          messageCount: conversation.messageCount + 2,
          lastMessageAt: new Date(),
        },
      );

      // Update chatbot statistics
      await this.chatbotsService.incrementMessages(sendMessageDto.chatbotId);

      return {
        message: aiMessage,
        aiResponse,
        conversation,
      };
    } catch (error) {
      this.logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get or create conversation
   */
  private async getOrCreateConversation(
    conversationId: string,
    userId: string,
    chatbotId: string,
    sessionId?: string,
  ): Promise<Conversation> {
    try {
      // Try to find existing conversation
      let conversation = await this.conversationModel
        .findOne({
          _id: conversationId,
          userId,
          chatbotId,
          deletedAt: null,
        })
        .exec();

      if (!conversation) {
        // Create new conversation
        conversation = new this.conversationModel({
          title: `Chat with ${chatbotId}`,
          status: ConversationStatus.ACTIVE,
          sessionId,
          userId,
          chatbotId,
          messageCount: 0,
        });

        conversation = await conversation.save();
        this.logger.log(`Created new conversation: ${conversation._id}`);
      }

      return conversation;
    } catch (error) {
      this.logger.error('Error getting or creating conversation:', error);
      throw error;
    }
  }

  /**
   * Save message to database
   */
  private async saveMessage(messageData: {
    conversationId: string;
    content: string;
    role: MessageRole;
    status: MessageStatus;
    metadata?: any;
  }): Promise<Message> {
    try {
      const message = new this.messageModel({
        ...messageData,
        type: 'text',
      });

      return await message.save();
    } catch (error) {
      this.logger.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Update conversation
   */
  private async updateConversation(
    conversationId: string,
    updateData: Partial<Conversation>,
  ): Promise<Conversation> {
    try {
      const conversation = await this.conversationModel
        .findByIdAndUpdate(
          conversationId,
          { ...updateData, updatedAt: new Date() },
          { new: true, runValidators: true },
        )
        .exec();

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      return conversation;
    } catch (error) {
      this.logger.error('Error updating conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Message[]> {
    try {
      // Verify conversation belongs to user
      const conversation = await this.conversationModel
        .findOne({
          _id: conversationId,
          userId,
          deletedAt: null,
        })
        .exec();

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Get messages
      const messages = await this.messageModel
        .find({
          conversationId,
          deletedAt: null,
        })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec();

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      this.logger.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  /**
   * Get user conversations
   */
  async getUserConversations(
    userId: string,
    chatbotId?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Conversation[]> {
    try {
      const filter: any = {
        userId,
        deletedAt: null,
      };

      if (chatbotId) {
        filter.chatbotId = chatbotId;
      }

      const conversations = await this.conversationModel
        .find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec();

      return conversations;
    } catch (error) {
      this.logger.error('Error getting user conversations:', error);
      throw error;
    }
  }

  /**
   * Close conversation
   */
  async closeConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      const conversation = await this.conversationModel
        .findOneAndUpdate(
          {
            _id: conversationId,
            userId,
            deletedAt: null,
          },
          {
            status: ConversationStatus.CLOSED,
            updatedAt: new Date(),
          },
        )
        .exec();

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      this.logger.log(`Closed conversation: ${conversationId}`);
    } catch (error) {
      this.logger.error('Error closing conversation:', error);
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      const conversation = await this.conversationModel
        .findOneAndUpdate(
          {
            _id: conversationId,
            userId,
            deletedAt: null,
          },
          {
            deletedAt: new Date(),
            updatedAt: new Date(),
          },
        )
        .exec();

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Soft delete all messages in the conversation
      await this.messageModel
        .updateMany({ conversationId }, { deletedAt: new Date() })
        .exec();

      this.logger.log(`Deleted conversation: ${conversationId}`);
    } catch (error) {
      this.logger.error('Error deleting conversation:', error);
      throw error;
    }
  }
}
