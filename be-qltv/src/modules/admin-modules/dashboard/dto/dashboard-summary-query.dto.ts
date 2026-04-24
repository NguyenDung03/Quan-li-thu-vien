import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class DashboardSummaryQueryDto {
  @ApiPropertyOptional({
    description:
      'Số ngày gần nhất (UTC) dùng cho chuỗi thời gian activityByDay; mặc định 30, tối đa 366',
    default: 30,
    minimum: 1,
    maximum: 366,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(366)
  days?: number = 30;
}
