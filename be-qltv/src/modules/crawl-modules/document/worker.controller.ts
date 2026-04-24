import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DocumentService } from './document.service';
import { ConfigService } from '@nestjs/config';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as fs from 'fs';

@Controller()
export class WorkerController {
  private readonly geminiApiKey: string;
  private fileManager: GoogleAIFileManager;

  constructor(
    private readonly documentService: DocumentService,
    private readonly configService: ConfigService,
  ) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY', '');

    if (!this.geminiApiKey) {
      console.error(
        '[Worker] LỖI: Không tìm thấy GEMINI_API_KEY trong cấu hình!',
      );
    } else {
      this.fileManager = new GoogleAIFileManager(this.geminiApiKey);
      console.log('[Worker] Đã load GEMINI_API_KEY và khởi tạo FileManager!');
    }
  }

  @EventPattern('upload_file_to_google')
  async handleFileUpload(
    @Payload() data: { filePath: string; sourceUrl: string },
  ) {
    console.log(`[Worker] Đang xử lý file từ RabbitMQ: ${data.filePath}`);

    try {
      if (!fs.existsSync(data.filePath)) {
        console.error(`[Worker] File không tồn tại: ${data.filePath}`);
        return;
      }

      let fileUri: string | null = null;

      if (this.fileManager) {
        const uploadResponse = await this.fileManager.uploadFile(
          data.filePath,
          {
            mimeType: 'text/markdown',
            displayName: 'Tai_Lieu_Thu_Vien',
          },
        );

        fileUri = uploadResponse.file.uri;
        console.log(`[Worker] Upload thành công! URI: ${fileUri}`);
      } else {
        console.warn(
          '[Worker] GEMINI_API_KEY không được cấu hình - chỉ lưu metadata',
        );
      }

      if (fileUri) {
        await this.documentService.saveDocumentInfo(
          data.sourceUrl,
          data.filePath,
          fileUri,
        );
      } else {
        await this.documentService.saveFromWorker({
          sourceUrl: data.sourceUrl,
          filePath: data.filePath,
          fileUri: null,
          displayName: 'Tài liệu Thư Viện (chưa upload Google)',
          mimeType: 'text/markdown',
        });
      }

      console.log(`[Worker] Xử lý hoàn tất cho file: ${data.filePath}`);
    } catch (error) {
      console.error(`[Worker] Lỗi xử lý file:`, error);

      try {
        await this.documentService.saveFromWorker({
          sourceUrl: data.sourceUrl,
          filePath: data.filePath,
          fileUri: null,
          displayName: 'Tài liệu Thư Viện - LỖI',
          mimeType: 'text/markdown',
        });
      } catch (dbError) {
        console.error('[Worker] Lỗi lưu vào DB:', dbError);
      }
    }
  }
}
