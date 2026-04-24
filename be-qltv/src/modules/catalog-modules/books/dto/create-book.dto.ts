import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { BookType } from 'src/common/enums/book-type.enum';
import { PhysicalBookType } from 'src/common/enums/physical-book-type.enum';

export class CreateBookDto {
  @ApiProperty({
    example: 'Tôi thấy hoa vàng trên cỏ xanh',
    description: 'Tiêu đề',
  })
  @IsString()
  title: string;

  @ApiProperty({ example: '9786041234567', description: 'ISBN' })
  @IsString()
  isbn: string;

  @ApiProperty({ example: 2024, description: 'Năm xuất bản' })
  @IsNumber()
  @IsInt()
  publishYear: number;

  @ApiPropertyOptional({ example: 'Tái bản 2', description: 'Phiên bản' })
  @IsOptional()
  @IsString()
  edition?: string;

  @ApiPropertyOptional({ example: 'Mô tả sách', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID ảnh bìa (nếu lưu trong hệ thống)',
  })
  @IsOptional()
  @IsUUID()
  coverImageId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/book-cover.jpg',
    description: 'URL ảnh bìa (nếu sử dụng link bên ngoài)',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ example: 'vi', description: 'Ngôn ngữ' })
  @IsString()
  language: string;

  @ApiProperty({ example: 250, description: 'Số trang' })
  @IsNumber()
  @IsInt()
  pageCount: number;

  @ApiProperty({
    enum: BookType,
    example: BookType.PHYSICAL,
    description: 'Loại sách (EBOOK hoặc PHYSICAL)',
  })
  @IsString()
  bookType: BookType;

  @ApiPropertyOptional({
    enum: PhysicalBookType,
    example: PhysicalBookType.BORROWABLE,
    description:
      'Loại sách vật lý (chỉ đọc tại thư viện hoặc mượn về) - chỉ áp dụng khi bookType là PHYSICAL',
  })
  @IsOptional()
  @IsString()
  physicalType?: PhysicalBookType;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID nhà xuất bản',
  })
  @IsUUID()
  publisherId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID danh mục chính',
  })
  @IsUUID()
  mainCategoryId: string;

  @ApiPropertyOptional({
    example: 5,
    description:
      'Số lượng bản sao vật lý - chỉ áp dụng khi bookType là PHYSICAL và physicalType là BORROWABLE',
  })
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(100)
  physicalCopiesQuantity?: number;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID file đã upload - chỉ áp dụng khi bookType là EBOOK',
  })
  @IsOptional()
  @IsUUID()
  uploadId?: string;

  @ApiPropertyOptional({
    example: 'A1',
    description:
      'Khu vực/vị trí mặc định cho các bản sao vật lý - chỉ áp dụng khi bookType là PHYSICAL và physicalType là BORROWABLE',
  })
  @IsOptional()
  @IsString()
  defaultLocationCode?: string;

  @ApiPropertyOptional({
    example: 120000,
    description:
      'Giá tham chiếu (VND) ghi vào mỗi bản sao khi tạo hàng loạt; dùng cho phạt — chỉ khi PHYSICAL + BORROWABLE + có số lượng bản',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  physicalCopyPrice?: number;

  @ApiPropertyOptional({
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    description: 'Danh sách ID tác giả',
  })
  @IsOptional()
  @IsUUID('all', { each: true })
  authorIds?: string[];

  @ApiPropertyOptional({
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    description: 'Danh sách ID khối lớp',
  })
  @IsOptional()
  @IsUUID('all', { each: true })
  gradeLevelIds?: string[];
}
