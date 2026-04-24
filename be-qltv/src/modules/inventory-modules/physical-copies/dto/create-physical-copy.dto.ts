import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePhysicalCopyDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách',
  })
  @IsUUID()
  bookId: string;

  @ApiProperty({ example: 'BC-000001', description: 'Mã vạch' })
  @IsString()
  barcode: string;

  @ApiProperty({ example: 'available', description: 'Trạng thái' })
  @IsString()
  status: string;

  @ApiProperty({ example: 'good', description: 'Tình trạng' })
  @IsString()
  currentCondition: string;

  @ApiPropertyOptional({
    example: 'Không rách',
    description: 'Chi tiết tình trạng',
  })
  @IsOptional()
  @IsString()
  conditionDetails?: string;

  @ApiPropertyOptional({ example: '2025-01-10', description: 'Ngày mua' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: 125000, description: 'Giá mua' })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({
    example: 150000,
    description: 'Giá tham chiếu — ưu tiên hơn giá mua khi tính đền bù',
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID vị trí',
  })
  @IsUUID()
  locationId: string;

  @ApiPropertyOptional({ example: 'Ghi chú', description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2025-02-01', description: 'Ngày kiểm tra' })
  @IsOptional()
  @IsDateString()
  lastCheckupDate?: string;

  @ApiPropertyOptional({ example: false, description: 'Lưu trữ' })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
