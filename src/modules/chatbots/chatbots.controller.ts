import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatbotsService } from './chatbots.service';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/auth.guard';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { ChatbotStatus } from './entities/chatbot.entity';

@Controller('chatbots')
@UseInterceptors(TransformInterceptor)
export class ChatbotsController {
  constructor(private readonly chatbotsService: ChatbotsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createChatbotDto: CreateChatbotDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatbotsService.create(createChatbotDto, {
      id: user.sub,
    } as any);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.chatbotsService.findAll(user.sub);
  }

  @Get('public/:id')
  findPublic(@Param('id') id: string) {
    return this.chatbotsService.findPublic(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.chatbotsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateChatbotDto: Partial<CreateChatbotDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatbotsService.update(id, updateChatbotDto, user.sub);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ChatbotStatus,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatbotsService.updateStatus(id, status, user.sub);
  }

  @Post(':id/embed-code')
  @UseGuards(AuthGuard)
  generateEmbedCode(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.chatbotsService.generateEmbedCode(id, user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.chatbotsService.remove(id, user.sub);
  }
}
