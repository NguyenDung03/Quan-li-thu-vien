import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FilterReaderDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Tìm theo họ tên, SĐT, mã thẻ, địa chỉ, tên đăng nhập hoặc email tài khoản',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
