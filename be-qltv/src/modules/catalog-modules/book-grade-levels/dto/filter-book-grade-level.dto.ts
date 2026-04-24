import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FilterBookGradeLevelDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Lọc theo ID sách (UUID)' })
  @IsOptional()
  @IsUUID()
  bookId?: string;
}
