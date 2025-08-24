import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
  namespace?: string;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface UpsertResponse {
  upsertedCount: number;
}

@Injectable()
export class PineconeService {
  private readonly logger = new Logger(PineconeService.name);
  private pinecone: Pinecone;
  private index: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('vectorStore.pineconeApiKey');
    const environment = this.configService.get(
      'vectorStore.pineconeEnvironment',
    );

    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is required');
    }

    this.pinecone = new Pinecone({
      apiKey,
    });
  }

  /**
   * Initialize the Pinecone index
   */
  async initializeIndex(): Promise<void> {
    try {
      const indexName = this.configService.get('vectorStore.pineconeIndexName');
      this.index = this.pinecone.index(indexName);

      // Test the connection
      await this.index.describeIndexStats();
      this.logger.log(`Pinecone index '${indexName}' initialized successfully`);
    } catch (error) {
      this.logger.error('Error initializing Pinecone index:', error);
      throw new Error('Failed to initialize Pinecone index');
    }
  }

  /**
   * Upsert vectors to the index
   */
  async upsertVectors(vectors: VectorRecord[]): Promise<UpsertResponse> {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      const response = await this.index.upsert(vectors);
      this.logger.log(`Upserted ${vectors.length} vectors to Pinecone`);

      return {
        upsertedCount: response.upsertedCount || vectors.length,
      };
    } catch (error) {
      this.logger.error('Error upserting vectors to Pinecone:', error);
      throw new Error('Failed to upsert vectors');
    }
  }

  /**
   * Query similar vectors
   */
  async queryVectors(
    vector: number[],
    options: {
      topK?: number;
      namespace?: string;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
    } = {},
  ): Promise<QueryResult[]> {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      const queryResponse = await this.index.query({
        vector,
        topK: options.topK || 10,
        namespace: options.namespace,
        filter: options.filter,
        includeMetadata: options.includeMetadata !== false,
      });

      return queryResponse.matches.map((match) => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata,
      }));
    } catch (error) {
      this.logger.error('Error querying vectors from Pinecone:', error);
      throw new Error('Failed to query vectors');
    }
  }

  /**
   * Delete vectors by IDs
   */
  async deleteVectors(ids: string[], namespace?: string): Promise<void> {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      await this.index.deleteMany(ids, { namespace });
      this.logger.log(`Deleted ${ids.length} vectors from Pinecone`);
    } catch (error) {
      this.logger.error('Error deleting vectors from Pinecone:', error);
      throw new Error('Failed to delete vectors');
    }
  }

  /**
   * Delete vectors by filter
   */
  async deleteVectorsByFilter(
    filter: Record<string, any>,
    namespace?: string,
  ): Promise<void> {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      await this.index.deleteMany([], { filter, namespace });
      this.logger.log('Deleted vectors by filter from Pinecone');
    } catch (error) {
      this.logger.error(
        'Error deleting vectors by filter from Pinecone:',
        error,
      );
      throw new Error('Failed to delete vectors by filter');
    }
  }

  /**
   * Update vector metadata
   */
  async updateMetadata(
    id: string,
    metadata: Record<string, any>,
    namespace?: string,
  ): Promise<void> {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      await this.index.update({
        id,
        setMetadata: metadata,
        namespace,
      });

      this.logger.log(`Updated metadata for vector ${id}`);
    } catch (error) {
      this.logger.error('Error updating vector metadata:', error);
      throw new Error('Failed to update vector metadata');
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<any> {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      const stats = await this.index.describeIndexStats();
      return stats;
    } catch (error) {
      this.logger.error('Error getting index stats:', error);
      throw new Error('Failed to get index statistics');
    }
  }

  /**
   * Fetch vectors by IDs
   */
  async fetchVectors(
    ids: string[],
    namespace?: string,
  ): Promise<VectorRecord[]> {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      const response = await this.index.fetch(ids, { namespace });

      return Object.entries(response.vectors).map(([id, vector]) => ({
        id,
        values: (vector as any).values,
        metadata: (vector as any).metadata,
        namespace: (vector as any).namespace,
      }));
    } catch (error) {
      this.logger.error('Error fetching vectors:', error);
      throw new Error('Failed to fetch vectors');
    }
  }

  /**
   * Health check for Pinecone service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getIndexStats();
      return true;
    } catch (error) {
      this.logger.error('Pinecone health check failed:', error);
      return false;
    }
  }
}
