import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  content: string;
  usage: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private chatSessions: Map<string, ChatSession> = new Map();

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('ai.geminiApiKey');
    const modelName = this.configService.get('ai.geminiModel');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Generate text completion
   */
  async generateText(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
  }): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 2048,
          topP: options?.topP || 0.8,
          topK: options?.topK || 40,
        },
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Error generating text with Gemini:', error);
      throw new Error('Failed to generate text response');
    }
  }

  /**
   * Start a new chat session
   */
  async startChat(sessionId: string, systemPrompt?: string): Promise<void> {
    try {
      const chat = this.model.startChat({
        history: systemPrompt ? [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I will follow your instructions.' }],
          },
        ] : [],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      this.chatSessions.set(sessionId, chat);
      this.logger.log(`Started new chat session: ${sessionId}`);
    } catch (error) {
      this.logger.error('Error starting chat session:', error);
      throw new Error('Failed to start chat session');
    }
  }

  /**
   * Send message to existing chat session
   */
  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    try {
      const chat = this.chatSessions.get(sessionId);
      if (!chat) {
        throw new Error('Chat session not found');
      }

      const result = await chat.sendMessage(message);
      const response = await result.response;

      return {
        content: response.text(),
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          responseTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
        },
        finishReason: result.response.candidates?.[0]?.finishReason || 'STOP',
      };
    } catch (error) {
      this.logger.error('Error sending message to chat session:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const chat = this.chatSessions.get(sessionId);
      if (!chat) {
        return [];
      }

      const history = await chat.getHistory();
      return history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.parts[0]?.text || '',
        timestamp: new Date(),
      }));
    } catch (error) {
      this.logger.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * End chat session
   */
  async endChat(sessionId: string): Promise<void> {
    this.chatSessions.delete(sessionId);
    this.logger.log(`Ended chat session: ${sessionId}`);
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await embeddingModel.embedContent(text);
      const embedding = await result.embedding;

      return {
        embedding: embedding.values,
        model: 'embedding-001',
      };
    } catch (error) {
      this.logger.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<EmbeddingResponse[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await embeddingModel.embedContent(texts);
      const embeddings = await result.embeddings;

      return embeddings.map((embedding, index) => ({
        embedding: embedding.values,
        model: 'embedding-001',
      }));
    } catch (error) {
      this.logger.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Health check for Gemini service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.generateText('Hello');
      return true;
    } catch (error) {
      this.logger.error('Gemini health check failed:', error);
      return false;
    }
  }
}
