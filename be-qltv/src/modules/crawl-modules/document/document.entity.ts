import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('documents')
export class Document {
  @ApiProperty({ example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'https://example.com/library-rules' })
  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl: string | null;

  @ApiProperty({ example: '/uploads/doc_1234567890.md' })
  @Column({ name: 'file_path', type: 'text', nullable: true })
  filePath: string | null;

  @ApiProperty({
    example: 'https://generativelanguage.googleapis.com/v1beta/files/...',
  })
  @Column({ name: 'file_uri', type: 'text', nullable: true })
  fileUri: string | null;

  @ApiProperty({ example: 'Tài liệu Thư Viện' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  displayName: string | null;

  @ApiProperty({ example: 'text/markdown' })
  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string | null;

  @ApiProperty({ example: 'uploaded' })
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
