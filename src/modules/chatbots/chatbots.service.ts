import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chatbot, ChatbotStatus } from './entities/chatbot.entity';
import { CreateChatbotDto } from './dto/create-chatbot.dto';

@Injectable()
export class ChatbotsService {
  constructor(
    @InjectModel(Chatbot.name)
    private readonly chatbotModel: Model<Chatbot>,
  ) {}

  async create(createChatbotDto: CreateChatbotDto, user: any): Promise<Chatbot> {
    const chatbot = new this.chatbotModel({
      ...createChatbotDto,
      userId: user.id,
      status: ChatbotStatus.DRAFT,
    });

    return chatbot.save();
  }

  async findAll(userId: string): Promise<Chatbot[]> {
    return this.chatbotModel.find({
      userId,
      deletedAt: null,
    }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<Chatbot> {
    const chatbot = await this.chatbotModel.findOne({
      _id: id,
      deletedAt: null,
    }).exec();

    if (!chatbot) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }

    if (chatbot.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return chatbot;
  }

  async findPublic(id: string): Promise<Chatbot> {
    const chatbot = await this.chatbotModel.findOne({
      _id: id,
      isPublic: true,
      status: ChatbotStatus.ACTIVE,
      deletedAt: null,
    }).exec();

    if (!chatbot) {
      throw new NotFoundException(`Public chatbot with ID ${id} not found`);
    }

    return chatbot;
  }

  async update(id: string, updateChatbotDto: Partial<CreateChatbotDto>, userId: string): Promise<Chatbot> {
    const chatbot = await this.findOne(id, userId);
    
    const updatedChatbot = await this.chatbotModel.findByIdAndUpdate(
      id,
      { ...updateChatbotDto, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedChatbot) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }

    return updatedChatbot;
  }

  async remove(id: string, userId: string): Promise<void> {
    const chatbot = await this.findOne(id, userId);
    await this.chatbotModel.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    }).exec();
  }

  async updateStatus(id: string, status: ChatbotStatus, userId: string): Promise<Chatbot> {
    const chatbot = await this.chatbotModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).exec();

    if (!chatbot) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }

    return chatbot;
  }

  async generateEmbedCode(id: string, userId: string): Promise<string> {
    const chatbot = await this.findOne(id, userId);
    
    const embedCode = `
      <div id="askforge-chatbot-${chatbot._id}"></div>
      <script>
        (function() {
          var script = document.createElement('script');
          script.src = '${process.env.FRONTEND_URL || 'http://localhost:3000'}/embed.js';
          script.async = true;
          script.onload = function() {
            AskForge.init({
              chatbotId: '${chatbot._id}',
              theme: ${JSON.stringify(chatbot.theme || {})}
            });
          };
          document.head.appendChild(script);
        })();
      </script>
    `;

    await this.chatbotModel.findByIdAndUpdate(id, {
      embedCode,
      updatedAt: new Date(),
    }).exec();
    
    return embedCode;
  }

  async incrementConversations(id: string): Promise<void> {
    await this.chatbotModel.findByIdAndUpdate(id, {
      $inc: { totalConversations: 1 },
    }).exec();
  }

  async incrementMessages(id: string): Promise<void> {
    await this.chatbotModel.findByIdAndUpdate(id, {
      $inc: { totalMessages: 1 },
    }).exec();
  }
}
