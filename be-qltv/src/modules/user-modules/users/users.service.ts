import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import dayjs from 'dayjs';
import _ from 'lodash';
import {
  PaginationDto,
  PaginationMetaDto,
} from 'src/common/dto/pagination-query.dto';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { Gender } from 'src/common/enums/gender.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import * as XLSX from 'xlsx';
import { ReaderType } from '../reader-types/entities/reader-type.entity';
import { Reader } from '../readers/entities/reader.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { ImportResultDto } from './dto/import-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
    @InjectRepository(ReaderType)
    private readonly readerTypeRepository: Repository<ReaderType>,
    private readonly dataSource: DataSource,
  ) {}

  calculateNextCardSequence(readers: { cardNumber: string }[]): string {
    if (!readers || readers.length === 0) {
      return '00001';
    }

    const maxSeq = readers.reduce((max, reader) => {
      const match = reader.cardNumber.match(/(\d{5})$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        return seq > max ? seq : max;
      }
      return max;
    }, 0);

    return (maxSeq + 1).toString().padStart(5, '0');
  }

  generateCardNumber(
    readerTypeId: string,
    readerTypes: { id: string; typeName: string }[],
    nextSequence: string,
  ): string {
    const year = new Date().getFullYear().toString().slice(-2);

    const readerType = readerTypes.find((rt) => rt.id === readerTypeId);
    const typePrefix = readerType?.typeName.toUpperCase().slice(0, 3) || 'UNK';

    return `HDA-${typePrefix}-${year}${nextSequence}`;
  }

  private calculateCardExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);
    return expiryDate;
  }

  async create(createUserDto: CreateUserDto) {
    const userExisted = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (userExisted) {
      throw new ConflictException('Người dùng đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;

    const role = createUserDto.role || UserRole.READER;
    createUserDto.role = role;
    createUserDto.accountStatus =
      createUserDto.accountStatus || AccountStatus.ACTIVE;

    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    if (role === UserRole.READER) {
      let readerType: ReaderType | null = null;
      if (createUserDto.readerTypeId) {
        readerType = await this.readerTypeRepository.findOne({
          where: { id: createUserDto.readerTypeId },
        });
      }

      if (!readerType) {
        readerType = await this.readerTypeRepository.findOne({
          where: { typeName: 'Student' },
        });
      }

      if (readerType) {
        let cardNumber: string;

        if (createUserDto.cardNumber) {
          cardNumber = createUserDto.cardNumber;
        } else {
          const allReaders = await this.readerRepository.find({
            select: ['cardNumber'],
          });
          const allReaderTypes = await this.readerTypeRepository.find({
            select: ['id', 'typeName'],
          });

          const nextSequence = this.calculateNextCardSequence(allReaders);
          cardNumber = this.generateCardNumber(
            readerType.id,
            allReaderTypes,
            nextSequence,
          );
        }

        const cardIssueDate = new Date();
        const cardExpiryDate = this.calculateCardExpiryDate();

        const reader = this.readerRepository.create({
          userId: savedUser.id,
          readerTypeId: readerType.id,
          fullName: savedUser.username, // Synchronized with username
          dob: createUserDto.dob
            ? new Date(createUserDto.dob)
            : new Date('2000-01-01'),
          gender: createUserDto.gender,
          address: createUserDto.address || '',
          phone: createUserDto.phone || '',
          cardNumber,
          cardIssueDate,
          cardExpiryDate,
          isActive: savedUser.accountStatus === AccountStatus.ACTIVE,
        });

        await this.readerRepository.save(reader);
      }
    }

    return _.omit(savedUser, 'password') as User;
  }

  async findAll(filterQuery: FilterUserDto): Promise<PaginationDto<User>> {
    const { page = 1, limit = 10, type, search, is_active } = filterQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const trimmedSearch = search?.trim();
    const parts: string[] = [];
    const params: Record<string, unknown> = {};

    if (type) {
      parts.push('user.role = :role');
      params.role = type;
    }
    if (typeof is_active === 'boolean') {
      parts.push('user.account_status = :accountStatus');
      params.accountStatus = is_active
        ? AccountStatus.ACTIVE
        : AccountStatus.INACTIVE;
    }
    if (trimmedSearch) {
      parts.push('(user.username ILIKE :search OR user.email ILIKE :search)');
      params.search = `%${trimmedSearch}%`;
    }

    if (parts.length > 0) {
      queryBuilder.where(parts.join(' AND '), params);
    }

    queryBuilder.orderBy('user.created_at', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return {
      data: data.map((user) => _.omit(user, 'password') as User),
      meta,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return _.omit(user, 'password') as User;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (updateUserDto.accountStatus !== undefined) {
      const reader = await this.readerRepository.findOne({
        where: { userId: id },
      });

      if (reader) {
        const isActive = updateUserDto.accountStatus === AccountStatus.ACTIVE;
        await this.readerRepository.update(reader.id, { isActive });
      }
    }

    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    const reader = await this.readerRepository.findOne({
      where: { userId: id },
    });

    if (reader) {
      await this.readerRepository.remove(reader);
    }

    return this.userRepository.remove(user);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async resetPassword(userId: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async importFromExcel(file: Express.Multer.File): Promise<ImportResultDto> {
    if (!file || !file.path) {
      throw new BadRequestException('File không hợp lệ hoặc trống');
    }

    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.promises.readFile(file.path);
    } catch {
      throw new BadRequestException(
        'Không thể đọc file. Vui lòng kiểm tra đường dẫn file.',
      );
    }

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch {
      throw new BadRequestException(
        'Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.',
      );
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new BadRequestException('File Excel không có sheet nào');
    }

    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (rows.length > 1000) {
      throw new BadRequestException(
        'Số lượng bản ghi tối đa là 1000. Vui lòng chia file Excel thành nhiều phần.',
      );
    }

    const results: ImportResultDto = {
      successCount: 0,
      skippedCount: 0,
      skippedRecords: [],
      totalCount: rows.length,
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUsers = await queryRunner.manager.find(User, {
        select: ['email', 'username'],
      });
      const existingEmails = new Set(
        existingUsers.map((u) => u.email.toLowerCase()),
      );
      const existingUsernames = new Set(
        existingUsers.map((u) => u.username.toLowerCase()),
      );

      const allReaders = await queryRunner.manager.find(Reader, {
        select: ['cardNumber'],
      });
      const allReaderTypes = await queryRunner.manager.find(ReaderType, {
        select: ['id', 'typeName'],
      });

      let currentSequence = Number.parseInt(
        this.calculateNextCardSequence(allReaders),
        10,
      );

      for (const row of rows) {
        try {
          const trimmedRow = this.trimAllStrings(
            row as Record<string, unknown>,
          );

          let username: string = '';
          let email: string = '';
          let password: string = '';

          if (trimmedRow.username != null) {
            username = this.toCellString(trimmedRow.username);
          }
          if (trimmedRow.email != null) {
            email = this.toCellString(trimmedRow.email);
          }
          if (trimmedRow.password != null) {
            password = this.toCellString(trimmedRow.password);
          }

          this.logger.debug(
            `Processing row - username: '${username}', email: '${email}', password: '${password}'`,
          );

          if (!username || !email || !password) {
            results.skippedRecords.push({
              email: email || 'unknown',
              reason: 'Thiếu trường bắt buộc',
            });
            results.skippedCount++;
            continue;
          }

          if (!emailRegex.test(email)) {
            results.skippedRecords.push({
              email,
              reason: 'Định dạng email không hợp lệ',
            });
            results.skippedCount++;
            continue;
          }

          if (password.length < 6) {
            results.skippedRecords.push({
              email,
              reason: 'Mật khẩu phải có ít nhất 6 ký tự',
            });
            results.skippedCount++;
            continue;
          }

          const emailKey = email.toLowerCase();
          if (existingEmails.has(emailKey)) {
            results.skippedRecords.push({
              email,
              reason: 'Email đã tồn tại',
            });
            results.skippedCount++;
            continue;
          }

          const usernameKey = username.toLowerCase();
          if (existingUsernames.has(usernameKey)) {
            results.skippedRecords.push({
              email,
              reason: 'Tên đăng nhập đã tồn tại',
            });
            results.skippedCount++;
            continue;
          }

          const role = this.mapRole(this.toCellString(trimmedRow.role));

          const readerTypeId = this.resolveReaderTypeId(
            this.toCellString(trimmedRow.readerType),
            allReaderTypes,
          );
          if (!readerTypeId) {
            results.skippedRecords.push({
              email,
              reason: 'Không có loại độc giả hợp lệ trong hệ thống',
            });
            results.skippedCount++;
            continue;
          }

          const cardIssueDate = this.parseDate(
            this.toCellString(trimmedRow.cardIssueDate),
          );
          const cardExpiryDate = this.parseDate(
            this.toCellString(
              trimmedRow.cardExpiryDate ?? trimmedRow.cardExpriryDate,
            ),
          );

          const hashedPassword = await bcrypt.hash(password, 10);
          const user = queryRunner.manager.create(User, {
            username,
            email,
            password: hashedPassword,
            role,
            accountStatus: AccountStatus.ACTIVE,
          });
          const savedUser = await queryRunner.manager.save(User, user);

          existingEmails.add(emailKey);

          const seqStr = currentSequence.toString().padStart(5, '0');
          const cardNumber = this.generateCardNumber(
            readerTypeId,
            allReaderTypes,
            seqStr,
          );

          const reader = queryRunner.manager.create(Reader, {
            userId: savedUser.id,
            readerTypeId,
            fullName: savedUser.username,
            dob: new Date('2000-01-01'),
            gender: Gender.MALE,
            address: '',
            phone: '',
            cardNumber,
            cardIssueDate: cardIssueDate || new Date(),
            cardExpiryDate: cardExpiryDate || this.calculateCardExpiryDate(),
            isActive: true,
          });
          await queryRunner.manager.save(Reader, reader);

          currentSequence++;

          results.successCount++;
        } catch (error) {
          const rowData = row as Record<string, unknown>;
          const email = this.toCellString(rowData.email) || 'unknown';
          this.logger.error(
            `Import row failed for ${email}, error: ${error instanceof Error ? error.message : String(error)}`,
            error instanceof Error ? error.stack : undefined,
          );
          const errorMessage = this.sanitizeErrorMessage(error);
          results.skippedRecords.push({
            email,
            reason: `Lỗi xử lý: ${errorMessage}`,
          });
          results.skippedCount++;
        }
      }

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Import thất bại. Tất cả thay đổi đã được hoàn tác.',
      );
    } finally {
      await queryRunner.release();
    }

    return results;
  }

  private sanitizeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('duplicate')) {
        return 'Email đã tồn tại';
      }
      if (error.message.includes('violates')) {
        return 'Dữ liệu không hợp lệ';
      }

      this.logger.error(`Import error: ${error.message}`, error.stack);
      return 'Lỗi xử lý bản ghi';
    }
    this.logger.error(`Import error (unknown): ${String(error)}`);
    return 'Lỗi không xác định';
  }

  private trimAllStrings(
    obj: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = typeof value === 'string' ? value.trim() : value;
    }
    return result;
  }

  private toCellString(value: unknown): string {
    if (value == null) {
      return '';
    }
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value).trim();
    }
    return '';
  }

  private mapRole(role: string): UserRole {
    const normalizedRole = role?.toLowerCase().trim();
    if (normalizedRole === 'quản trị viên') {
      return UserRole.ADMIN;
    }
    return UserRole.READER;
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private resolveReaderTypeId(
    readerType: string,
    readerTypes: { id: string; typeName: string }[],
  ): string | undefined {
    if (!readerTypes.length) {
      return undefined;
    }

    const normalizedInput = this.normalizeText(readerType);
    const normalizedTypes = readerTypes.map((item) => ({
      ...item,
      normalizedName: this.normalizeText(item.typeName),
    }));

    const directMatch = normalizedTypes.find(
      (item) =>
        item.normalizedName === normalizedInput ||
        item.normalizedName.includes(normalizedInput) ||
        normalizedInput.includes(item.normalizedName),
    );
    if (directMatch) {
      return directMatch.id;
    }

    const aliasMap: Array<{ keywords: string[]; targets: string[] }> = [
      { keywords: ['giao vien', 'teacher'], targets: ['giao vien', 'teacher'] },
      {
        keywords: ['nhan vien', 'can bo', 'staff'],
        targets: ['nhan vien', 'can bo', 'staff'],
      },
      { keywords: ['hoc sinh', 'student'], targets: ['hoc sinh', 'student'] },
    ];

    for (const alias of aliasMap) {
      if (
        !alias.keywords.some((keyword) => normalizedInput.includes(keyword))
      ) {
        continue;
      }
      const matchedType = normalizedTypes.find((item) =>
        alias.targets.some((target) => item.normalizedName.includes(target)),
      );
      if (matchedType) {
        return matchedType.id;
      }
    }

    const studentType = normalizedTypes.find(
      (item) =>
        item.normalizedName.includes('hoc sinh') ||
        item.normalizedName.includes('student'),
    );
    return studentType?.id ?? readerTypes[0].id;
  }

  private parseDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined;

    const parsed = dayjs(
      dateStr,
      [
        'DD-MM-YYYY',
        'D-M-YYYY',
        'DD-MM-YY',
        'D-M-YY',
        'YYYY-MM-DD',
        'DD/MM/YYYY',
        'D/M/YYYY',
        'DD/MM/YY',
        'D/M/YY',
      ],
      true,
    );
    if (parsed.isValid()) {
      return parsed.toDate();
    }
    return undefined;
  }
}
