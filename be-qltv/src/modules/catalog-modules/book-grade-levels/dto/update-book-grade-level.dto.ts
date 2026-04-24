import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateBookGradeLevelDto {
  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách mới',
  })
  @IsOptional()
  @IsUUID()
  bookId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID khối lớp mới',
  })
  @IsOptional()
  @IsUUID()
  gradeLevelId?: string;
}
