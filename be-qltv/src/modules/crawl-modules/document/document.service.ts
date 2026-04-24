import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('📄 Documents')
@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async create(createDto: Partial<Document>): Promise<Document> {
    const document = this.documentRepository.create(createDto);
    return this.documentRepository.save(document);
  }

  async findAll(): Promise<Document[]> {
    return this.documentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }
    return document;
  }

  async update(id: string, updateDto: Partial<Document>): Promise<Document> {
    const document = await this.findOne(id);
    Object.assign(document, updateDto);
    return this.documentRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    await this.documentRepository.remove(document);
  }

  async saveDocumentInfo(
    sourceUrl: string,
    filePath: string,
    fileUri: string,
  ): Promise<Document> {
    const newDocument = this.documentRepository.create({
      sourceUrl,
      filePath,
      fileUri,
      displayName: 'Tài liệu Thư Viện',
      mimeType: 'text/markdown',
      status: 'uploaded',
    });

    const savedDoc = await this.documentRepository.save(newDocument);
    console.log(
      `[DB Service] Đã lưu thành công định danh vào Postgres với ID: ${savedDoc.id}`,
    );
    return savedDoc;
  }

  async saveFromWorker(data: {
    sourceUrl: string;
    filePath: string;
    fileUri: string | null;
    displayName?: string;
    mimeType?: string;
  }): Promise<Document> {
    return this.create({
      sourceUrl: data.sourceUrl,
      filePath: data.filePath,
      fileUri: data.fileUri,
      displayName: data.displayName || 'Tài liệu Thư Viện',
      mimeType: data.mimeType || 'text/markdown',
      status: data.fileUri ? 'uploaded' : 'pending',
    });
  }
}
