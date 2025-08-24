import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Transform } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  PREMIUM = 'premium',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Schema({ collection: 'users', timestamps: true })
export class User extends BaseEntity {
  @Prop({ required: true, maxlength: 255 })
  firstName: string;

  @Prop({ required: true, maxlength: 255 })
  lastName: string;

  @Prop({ required: true, unique: true, maxlength: 255 })
  email: string;

  @Prop({ maxlength: 255 })
  phone?: string;

  @Prop()
  avatar?: string;

  @Exclude()
  @Prop({ required: true })
  password: string;

  @Prop({ 
    type: String, 
    enum: UserRole, 
    default: UserRole.USER 
  })
  role: UserRole;

  @Prop({ 
    type: String, 
    enum: UserStatus, 
    default: UserStatus.ACTIVE 
  })
  status: UserStatus;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailVerifiedAt?: Date;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ type: Object })
  preferences?: Record<string, any>;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Add virtual for fullName
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
