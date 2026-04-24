import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MarkLostBookDto {
  @ApiProperty({ description: 'ID thủ thư xác nhận mất sách' })
  @IsUUID()
  librarianId: string;
}
