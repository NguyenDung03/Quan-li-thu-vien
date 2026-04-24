import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReservationStatus } from 'src/common/enums/reservation-status.enum';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @ApiPropertyOptional({
    description: 'Trạng thái mới của đặt trước',
    enum: ReservationStatus,
  })
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Lý do hủy (nếu chuyển trạng thái sang CANCELLED)',
    example: 'Xác nhận hủy theo yêu cầu',
  })
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
