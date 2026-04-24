import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhysicalCopyCondition } from 'src/common/enums/physical-copy-condition.enum';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReturnBookDto {
  @ApiProperty({ description: 'ID thủ thư xử lý trả sách' })
  @IsUUID()
  librarianId: string;

  @ApiPropertyOptional({
    enum: PhysicalCopyCondition,
    description:
      'Tình trạng khi nhận lại (nếu gửi sẽ cập nhật lên bản sao và dùng để so với lúc mượn)',
  })
  @IsOptional()
  @IsEnum(PhysicalCopyCondition)
  receivedCondition?: PhysicalCopyCondition;

  @ApiPropertyOptional({ description: 'Ghi chú tình trạng khi nhận' })
  @IsOptional()
  @IsString()
  conditionDetails?: string;
}
