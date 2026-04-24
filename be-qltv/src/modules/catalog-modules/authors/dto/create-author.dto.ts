import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Nguyễn Nhật Ánh', description: 'Tên tác giả' })
  @IsString()
  authorName: string;

  @ApiPropertyOptional({ example: 'Tiểu sử ngắn', description: 'Tiểu sử' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Việt Nam', description: 'Quốc tịch' })
  @IsOptional()
  @IsString()
  nationality?: string;
}
