import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateReaderTypeDto {
  @ApiProperty({
    example: 'Học sinh',
    description: 'Tên loại độc giả',
  })
  @IsString()
  typeName: string;

  @ApiProperty({
    example: 5,
    description: 'Số lượng sách được mượn tối đa',
  })
  @IsInt()
  @Min(1)
  maxBorrowLimit: number;

  @ApiProperty({
    example: 14,
    description: 'Số ngày được mượn',
  })
  @IsInt()
  @Min(1)
  borrowDurationDays: number;
}
