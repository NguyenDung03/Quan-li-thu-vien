import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File tài liệu cần tải lên (PDF, DOCX, EPUB...)',
  })
  @IsNotEmpty()
  file: any;
}
