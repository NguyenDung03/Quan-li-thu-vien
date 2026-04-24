import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'Kho A', description: 'Tên vị trí' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'kho-a', description: 'Slug' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Khu vực lưu trữ', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2, description: 'Tầng' })
  @IsOptional()
  @IsNumber()
  @IsInt()
  floor?: number;

  @ApiPropertyOptional({ example: 'A', description: 'Khu' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({ example: 'S1', description: 'Kệ' })
  @IsOptional()
  @IsString()
  shelf?: string;

  @ApiPropertyOptional({ example: true, description: 'Hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
