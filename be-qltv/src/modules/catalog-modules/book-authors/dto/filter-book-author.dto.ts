import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FilterBookAuthorDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Lọc theo ID sách (UUID)' })
  @IsOptional()
  @IsUUID()
  bookId?: string;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  search?: string;
}
