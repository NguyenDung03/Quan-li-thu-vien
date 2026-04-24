import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base.entity';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Column, Entity, OneToOne } from 'typeorm';
import { Reader } from '../../readers/entities/reader.entity';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ example: 'john_doe', description: 'Tên đăng nhập' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Địa chỉ Email' })
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.READER,
    description: 'Vai trò người dùng',
  })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.READER })
  role: UserRole;

  @ApiProperty({
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
    description: 'Trạng thái tài khoản',
  })
  @Column({
    name: 'account_status',
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  accountStatus: AccountStatus;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Lần đăng nhập cuối',
  })
  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @OneToOne(() => Reader, (reader) => reader.user)
  reader: Reader;
}
