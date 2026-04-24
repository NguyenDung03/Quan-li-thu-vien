import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBookCategoryDto {
  @ApiProperty({ example: 'Văn học', description: 'Tên danh mục' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID danh mục cha',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
