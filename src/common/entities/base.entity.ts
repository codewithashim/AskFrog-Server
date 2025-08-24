import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export abstract class BaseEntity extends Document {
  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}
