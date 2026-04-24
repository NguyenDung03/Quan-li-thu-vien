import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { BookType } from 'src/common/enums/book-type.enum';
import { PhysicalBookType } from 'src/common/enums/physical-book-type.enum';

export class FilterBookDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Loại sách: EBOOK hoặc PHYSICAL',
    enum: BookType,
  })
  @IsOptional()
  @IsEnum(BookType)
  bookType?: BookType;

  @ApiPropertyOptional({
    description: 'Loại sách vật lý: BORROWABLE hoặc LIBRARY_USE',
    enum: PhysicalBookType,
  })
  @IsOptional()
  @IsEnum(PhysicalBookType)
  physicalType?: PhysicalBookType;

  @ApiPropertyOptional({
    description: 'Lọc sách vật lý có bản sao khả dụng (AVAILABLE)',
  })
  @IsOptional()
  @IsString()
  availablePhysical?: string;
}
