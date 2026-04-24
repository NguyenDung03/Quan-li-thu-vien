import {
  Controller,
  Post,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Inject,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('💬 Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('files'))
  @ApiOperation({ summary: 'Gửi câu hỏi và nhận phản hồi streaming' })
  async chat(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: { message: string },
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<void> {
    const userId = req.user.sub;
    const userMessage = body?.message || '';

    const lockKey = `lock_${userId}`;

    const isLocked = await this.cacheManager.get(lockKey);
    if (isLocked) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
      res.write(
        `data: ${JSON.stringify({ text: 'Bot đang trả lời, vui lòng chờ trong giây lát...' })}\n\n`,
      );
      res.end();
      return;
    }

    await this.cacheManager.set(lockKey, true, 60000);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const chunk of this.chatService.processChatStream(
        userId,
        userMessage,
        file,
      )) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    } catch (error: any) {
      console.error('[ChatController] Lỗi quá trình Chat:', error);
      const errorMsg = `\n\n[LỖI] Đã xảy ra lỗi: ${error.message || 'Unknown error'}`;
      res.write(`data: ${JSON.stringify({ text: errorMsg })}\n\n`);
    } finally {
      await this.cacheManager.del(lockKey);
      res.end();
    }
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Xóa lịch sử chat' })
  @ApiResponse({ status: 204, description: 'Đã xóa lịch sử chat' })
  async clearHistory(@Req() req: any): Promise<void> {
    const userId = req.user.sub;
    await this.chatService.clearChatHistory(userId);
  }
}
