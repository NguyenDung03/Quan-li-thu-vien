import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CrawlUrlDto {
  @ApiProperty({
    description: 'Danh sách URL cần crawl',
    example: ['https://example.com/library'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  urls: string[];

  @ApiPropertyOptional({
    description: 'Độ ưu tiên của tác vụ (0-100, mặc định: 10)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  priority?: number = 10;
}

export class CrawlResponseDto {
  @ApiProperty({
    description: 'Trạng thái kết quả',
    example: 'success',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Dữ liệu đã crawl',
    example: {},
  })
  data: Record<string, unknown>;

  @ApiProperty({
    description: 'Thời gian xử lý (ms)',
    example: 1500,
  })
  @IsInt()
  time: number;
}
