import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PineconeService } from './pinecone.service';

export interface RAGResponse {
  answer: string;
  sources: Array<{
    id: string;
    content: string;
    score: number;
    metadata?: Record<string, any>;
  }>;
  usage: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    documentId: string;
    chunkIndex: number;
    userId: string;
    chatbotId?: string;
    [key: string]: any;
  };
}

@Injectable()
export class AIOrchestratorService {
  private readonly logger = new Logger(AIOrchestratorService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly pineconeService: PineconeService,
  ) {}

  /**
   * Process and store document chunks in vector store
   */
  async processDocument(
    chunks: DocumentChunk[],
    namespace?: string,
  ): Promise<void> {
    try {
      // Generate embeddings for all chunks
      const texts = chunks.map((chunk) => chunk.content);
      const embeddings = await this.geminiService.generateEmbeddings(texts);

      // Prepare vectors for Pinecone
      const vectors = chunks.map((chunk, index) => ({
        id: chunk.id,
        values: embeddings[index].embedding,
        metadata: {
          ...chunk.metadata,
          content: chunk.content,
          embeddingModel: embeddings[index].model,
        },
        namespace,
      }));

      // Store in Pinecone
      await this.pineconeService.upsertVectors(vectors);
      this.logger.log(`Processed and stored ${chunks.length} document chunks`);
    } catch (error) {
      this.logger.error('Error processing document:', error);
      throw new Error('Failed to process document');
    }
  }

  /**
   * Generate RAG response using retrieved context
   */
  async generateRAGResponse(
    question: string,
    options: {
      chatbotId?: string;
      userId?: string;
      namespace?: string;
      topK?: number;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<RAGResponse> {
    try {
      // Generate embedding for the question
      const questionEmbedding =
        await this.geminiService.generateEmbedding(question);

      // Build filter for relevant documents
      const filter: Record<string, any> = {};
      if (options.chatbotId) {
        filter.chatbotId = options.chatbotId;
      }
      if (options.userId) {
        filter.userId = options.userId;
      }

      // Query similar vectors from Pinecone
      const similarVectors = await this.pineconeService.queryVectors(
        questionEmbedding.embedding,
        {
          topK: options.topK || 5,
          namespace: options.namespace,
          filter: Object.keys(filter).length > 0 ? filter : undefined,
          includeMetadata: true,
        },
      );

      if (similarVectors.length === 0) {
        // No relevant context found, generate direct response
        const directResponse = await this.geminiService.generateText(question, {
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2048,
        });

        return {
          answer: directResponse,
          sources: [],
          usage: {
            promptTokens: 0,
            responseTokens: 0,
            totalTokens: 0,
          },
        };
      }

      // Prepare context from retrieved documents
      const context = similarVectors
        .map((result) => result.metadata?.content || '')
        .filter((content) => content.length > 0)
        .join('\n\n');

      // Create RAG prompt
      const ragPrompt = this.createRAGPrompt(question, context);

      // Generate response using Gemini
      const response = await this.geminiService.generateText(ragPrompt, {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2048,
      });

      return {
        answer: response,
        sources: similarVectors.map((result) => ({
          id: result.id,
          content: result.metadata?.content || '',
          score: result.score,
          metadata: result.metadata,
        })),
        usage: {
          promptTokens: 0, // Gemini doesn't provide token usage in this context
          responseTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      this.logger.error('Error generating RAG response:', error);
      throw new Error('Failed to generate RAG response');
    }
  }

  /**
   * Chat with context-aware responses
   */
  async chatWithContext(
    sessionId: string,
    message: string,
    options: {
      chatbotId?: string;
      userId?: string;
      namespace?: string;
      topK?: number;
    } = {},
  ): Promise<RAGResponse> {
    try {
      // Start chat session if not exists
      const systemPrompt = this.createSystemPrompt(options.chatbotId);
      await this.geminiService.startChat(sessionId, systemPrompt);

      // Generate RAG response
      const ragResponse = await this.generateRAGResponse(message, options);

      // Send message to chat session
      const chatResponse = await this.geminiService.sendMessage(
        sessionId,
        message,
      );

      return {
        answer: chatResponse.content,
        sources: ragResponse.sources,
        usage: chatResponse.usage,
      };
    } catch (error) {
      this.logger.error('Error in chat with context:', error);
      throw new Error('Failed to chat with context');
    }
  }

  /**
   * Delete document chunks from vector store
   */
  async deleteDocumentChunks(
    documentId: string,
    namespace?: string,
  ): Promise<void> {
    try {
      await this.pineconeService.deleteVectorsByFilter(
        { documentId },
        namespace,
      );
      this.logger.log(`Deleted chunks for document: ${documentId}`);
    } catch (error) {
      this.logger.error('Error deleting document chunks:', error);
      throw new Error('Failed to delete document chunks');
    }
  }

  /**
   * Search for similar content
   */
  async searchSimilarContent(
    query: string,
    options: {
      chatbotId?: string;
      userId?: string;
      namespace?: string;
      topK?: number;
    } = {},
  ): Promise<
    Array<{
      id: string;
      content: string;
      score: number;
      metadata?: Record<string, any>;
    }>
  > {
    try {
      const queryEmbedding = await this.geminiService.generateEmbedding(query);

      const filter: Record<string, any> = {};
      if (options.chatbotId) {
        filter.chatbotId = options.chatbotId;
      }
      if (options.userId) {
        filter.userId = options.userId;
      }

      const results = await this.pineconeService.queryVectors(
        queryEmbedding.embedding,
        {
          topK: options.topK || 10,
          namespace: options.namespace,
          filter: Object.keys(filter).length > 0 ? filter : undefined,
          includeMetadata: true,
        },
      );

      return results.map((result) => ({
        id: result.id,
        content: result.metadata?.content || '',
        score: result.score,
        metadata: result.metadata,
      }));
    } catch (error) {
      this.logger.error('Error searching similar content:', error);
      throw new Error('Failed to search similar content');
    }
  }

  /**
   * Create RAG prompt with context
   */
  private createRAGPrompt(question: string, context: string): string {
    return `You are a helpful AI assistant. Use the following context to answer the question. If the context doesn't contain relevant information, say so but still try to provide a helpful response.

Context:
${context}

Question: ${question}

Answer:`;
  }

  /**
   * Create system prompt for chatbot
   */
  private createSystemPrompt(chatbotId?: string): string {
    return `You are a helpful AI assistant${chatbotId ? ` for chatbot ${chatbotId}` : ''}. 
    
Your responses should be:
- Accurate and helpful
- Based on the provided context when available
- Conversational and engaging
- Appropriate for the user's needs

Always be respectful and professional in your interactions.`;
  }

  /**
   * Health check for AI orchestrator
   */
  async healthCheck(): Promise<{
    gemini: boolean;
    pinecone: boolean;
    overall: boolean;
  }> {
    try {
      const geminiHealth = await this.geminiService.healthCheck();
      const pineconeHealth = await this.pineconeService.healthCheck();

      return {
        gemini: geminiHealth,
        pinecone: pineconeHealth,
        overall: geminiHealth && pineconeHealth,
      };
    } catch (error) {
      this.logger.error('AI orchestrator health check failed:', error);
      return {
        gemini: false,
        pinecone: false,
        overall: false,
      };
    }
  }
}
