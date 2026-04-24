import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('system_settings')
export class SystemSetting extends BaseEntity {
  @ApiProperty({
    example: 'OVERDUE_FEE_PER_DAY',
    description: 'Khóa cấu hình (duy nhất)',
  })
  @Column({ name: 'setting_key', unique: true })
  settingKey: string;

  @ApiProperty({
    example: '5000',
    description: 'Giá trị (chuỗi, thường là số)',
  })
  @Column({ name: 'setting_value', type: 'text' })
  settingValue: string;
}
