import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePublisherDto {
  @ApiProperty({ example: 'NXB Giáo Dục', description: 'Tên nhà xuất bản' })
  @IsString()
  publisherName: string;

  @ApiPropertyOptional({ example: 'Hà Nội', description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '02412345678', description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'nxb@example.com', description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;
}
