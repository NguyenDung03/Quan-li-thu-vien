import { ApiProperty } from '@nestjs/swagger';

export class ImportResultDto {
  @ApiProperty({ example: 95, description: 'Số bản ghi thành công' })
  successCount: number;

  @ApiProperty({ example: 5, description: 'Số bản ghi bị bỏ qua' })
  skippedCount: number;

  @ApiProperty({ description: 'Danh sách bản ghi bị bỏ qua' })
  skippedRecords: {
    email: string;
    reason: string;
  }[];

  @ApiProperty({ example: 100, description: 'Tổng số bản ghi' })
  totalCount: number;
}
