import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FilterBorrowRecordDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Tìm theo tên độc giả, mã thẻ thư viện hoặc tên sách (không phân biệt hoa thường)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID độc giả (UUID)' })
  @IsOptional()
  @IsUUID()
  readerId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái (borrowed, returned, overdue, renewed)',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
