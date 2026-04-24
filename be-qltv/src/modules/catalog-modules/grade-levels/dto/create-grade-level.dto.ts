import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGradeLevelDto {
  @ApiProperty({ example: 'Lớp 10', description: 'Tên khối lớp' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Khối lớp 10', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10, description: 'Thứ tự' })
  @IsNumber()
  @IsInt()
  orderNo: number;
}
