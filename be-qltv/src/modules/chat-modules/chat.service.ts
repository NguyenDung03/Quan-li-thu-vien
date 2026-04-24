import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerativeModel } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { Document } from '../crawl-modules/document/document.entity';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
}

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private fileManager: GoogleAIFileManager;
  private readonly SESSION_TTL = 3600;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    if (geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(geminiApiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });
      this.fileManager = new GoogleAIFileManager(geminiApiKey);
      console.log(
        '[ChatService] Đã khởi tạo Google GenAI model + FileManager!',
      );
    } else {
      console.error('[ChatService] LỖI: Không tìm thấy GEMINI_API_KEY!');
    }
  }

  private getSessionKey(userId: string): string {
    return `chat_session_${userId}`;
  }

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    const sessionKey = this.getSessionKey(userId);
    const history = await this.cacheManager.get<ChatMessage[]>(sessionKey);
    return history || [];
  }

  async saveChatHistory(
    userId: string,
    messages: ChatMessage[],
  ): Promise<void> {
    const sessionKey = this.getSessionKey(userId);
    await this.cacheManager.set(sessionKey, messages, this.SESSION_TTL);
  }

  async addMessageToHistory(
    userId: string,
    role: 'user' | 'model',
    content: string,
  ): Promise<void> {
    const messages = await this.getChatHistory(userId);
    messages.push({ role, content });

    if (messages.length > 20) {
      messages.splice(0, messages.length - 20);
    }
    await this.saveChatHistory(userId, messages);
  }

  async getDocumentUri(): Promise<string | null> {
    const document = await this.documentRepository.findOne({
      where: { status: 'uploaded' },
      order: { createdAt: 'DESC' },
    });
    return document?.fileUri ?? null;
  }

  async clearChatHistory(userId: string): Promise<void> {
    const sessionKey = this.getSessionKey(userId);
    await this.cacheManager.del(sessionKey);
  }

  async uploadFileToGoogle(file: Express.Multer.File): Promise<string> {
    if (!this.fileManager) {
      throw new Error(
        'FileManager chưa được khởi tạo. Kiểm tra GEMINI_API_KEY.',
      );
    }

    try {
      console.log(
        `[ChatService] Đang upload file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`,
      );

      const uploadResult = await this.fileManager.uploadFile(file.buffer, {
        mimeType: file.mimetype,
        displayName: file.originalname,
      });

      const fileUri = uploadResult.file.uri;
      console.log(`[ChatService] Upload thành công! URI: ${fileUri}`);

      return fileUri;
    } catch (error: any) {
      console.error('[ChatService] Lỗi upload file lên Google:', error);
      throw new Error(
        `Không thể upload file: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async *processChatStream(
    userId: string,
    currentQuestion: string,
    uploadedFile?: Express.Multer.File, // Sử dụng thẳng file upload (Dựa vào luồng cấu trúc mới)
  ): AsyncGenerator<string, void, unknown> {
    if (!this.model) {
      yield '[LỖI] Chat service chưa được khởi tạo. Vui lòng liên hệ quản trị viên.';
      return;
    }

    try {
      let fileUri: string | null = null;
      let mimeType = 'text/markdown';
      let userText = currentQuestion;

      if (uploadedFile) {
        fileUri = await this.uploadFileToGoogle(uploadedFile);

        await this.cacheManager.set(`user_file_${userId}`, fileUri, 172800000);

        mimeType = uploadedFile.mimetype;
        userText = `Dựa vào tài liệu cá nhân tôi vừa đính kèm, hãy trả lời: ${currentQuestion}`;
      } else {
        fileUri =
          (await this.cacheManager.get<string>(`user_file_${userId}`)) ?? null;

        if (fileUri) {
          mimeType = 'application/pdf';
        } else {
          fileUri = (await this.getDocumentUri()) ?? null;
        }
      }

      if (!fileUri) {
        yield 'Xin lỗi, hệ thống chưa được nạp tài liệu thư viện nào và bạn chưa đính kèm tài liệu. Vui lòng thử lại.';
        return;
      }

      const history = await this.getChatHistory(userId);

      const formattedHistory = history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const contents = [
        ...formattedHistory,
        {
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType,
                fileUri,
              },
            },
            { text: userText },
          ],
        },
      ];

      await this.addMessageToHistory(userId, 'user', currentQuestion);

      const result = await this.model.generateContentStream({
        contents,
        systemInstruction:
          'Bạn là trợ lý ảo của thư viện. Dựa TỐI ĐA vào tài liệu được cung cấp để trả lời câu hỏi. KHÔNG được bịa đặt thông tin. Nếu trong tài liệu không có, hãy nói là không tìm thấy quy định.',
      });

      let fullResponse = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        yield chunkText;
      }

      await this.addMessageToHistory(userId, 'model', fullResponse);
    } catch (error) {
      console.error('[ChatService] Lỗi khi stream AI:', error);

      if (error.response) {
        console.error('[ChatService] Response error:', error.response.data);
      }
      const errorMsg = error.message || error.toString() || 'Unknown error';
      yield `Đã có lỗi xảy ra: ${errorMsg}`;
    }
  }
}
