import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { ChatService, SendMessageDto } from '../services/chat.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/guards/auth.guard';
import { TransformInterceptor } from '../../../common/interceptors/transform.interceptor';

export class SendMessageRequestDto {
  conversationId: string;
  content: string;
  chatbotId: string;
  sessionId?: string;
}

@Controller('chat')
@UseInterceptors(TransformInterceptor)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @UseGuards(AuthGuard)
  async sendMessage(
    @Body() sendMessageDto: SendMessageRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const messageData: SendMessageDto = {
      ...sendMessageDto,
      userId: user.sub,
    };

    return this.chatService.sendMessage(messageData);
  }

  @Get('conversations')
  @UseGuards(AuthGuard)
  async getUserConversations(
    @CurrentUser() user: JwtPayload,
    @Query('chatbotId') chatbotId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.getUserConversations(
      user.sub,
      chatbotId,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('conversations/:conversationId/messages')
  @UseGuards(AuthGuard)
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.getConversationMessages(
      conversationId,
      user.sub,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Delete('conversations/:conversationId')
  @UseGuards(AuthGuard)
  async closeConversation(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.chatService.closeConversation(conversationId, user.sub);
    return { message: 'Conversation closed successfully' };
  }

  @Delete('conversations/:conversationId/delete')
  @UseGuards(AuthGuard)
  async deleteConversation(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.chatService.deleteConversation(conversationId, user.sub);
    return { message: 'Conversation deleted successfully' };
  }
}
