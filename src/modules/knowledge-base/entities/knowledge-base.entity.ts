import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum DocumentType {
  TEXT = 'text',
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
  MARKDOWN = 'markdown',
  URL = 'url',
}

export enum DocumentStatus {
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

@Schema({ collection: 'knowledge_base', timestamps: true })
export class KnowledgeBase extends BaseEntity {
  @Prop({ required: true, maxlength: 255 })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: DocumentType,
    required: true,
  })
  type: DocumentType;

  @Prop({
    type: String,
    enum: DocumentStatus,
    default: DocumentStatus.PROCESSING,
  })
  status: DocumentStatus;

  @Prop()
  content?: string;

  @Prop()
  filePath?: string;

  @Prop()
  fileUrl?: string;

  @Prop()
  fileSize?: number;

  @Prop()
  mimeType?: string;

  @Prop({ type: Object })
  metadata?: {
    author?: string;
    keywords?: string[];
    summary?: string;
    pageCount?: number;
    language?: string;
  };

  @Prop({ type: Object })
  embeddings?: {
    vector?: number[];
    chunkId?: string;
    pageNumber?: number;
  };

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ required: true, ref: 'User' })
  userId: string;
}

export const KnowledgeBaseSchema = SchemaFactory.createForClass(KnowledgeBase);
