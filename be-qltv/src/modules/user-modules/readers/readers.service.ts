import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginationDto,
  PaginationMetaDto,
} from 'src/common/dto/pagination-query.dto';
import { FilterReaderDto } from './dto/filter-reader.dto';
import { Repository } from 'typeorm';
import { ReaderType } from '../reader-types/entities/reader-type.entity';
import { User } from '../users/entities/user.entity';
import { CreateReaderDto } from './dto/create-reader.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';
import { Reader } from './entities/reader.entity';

@Injectable()
export class ReadersService {
  constructor(
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReaderType)
    private readonly readerTypeRepository: Repository<ReaderType>,
  ) {}

  async create(createReaderDto: CreateReaderDto): Promise<Reader> {
    const user = await this.userRepository.findOne({
      where: { id: createReaderDto.userId },
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const readerType = await this.readerTypeRepository.findOne({
      where: { id: createReaderDto.readerTypeId },
    });

    if (!readerType) {
      throw new BadRequestException('Loại độc giả không tồn tại');
    }

    const existedByUser = await this.readerRepository.findOne({
      where: { userId: createReaderDto.userId },
    });

    if (existedByUser) {
      throw new ConflictException('Người dùng này đã có hồ sơ độc giả');
    }

    const existedByCard = await this.readerRepository.findOne({
      where: { cardNumber: createReaderDto.cardNumber },
    });

    if (existedByCard) {
      throw new ConflictException('Mã thẻ thư viện đã tồn tại');
    }

    const reader = this.readerRepository.create({
      ...createReaderDto,
      dob: new Date(createReaderDto.dob),
      cardIssueDate: new Date(createReaderDto.cardIssueDate),
      cardExpiryDate: new Date(createReaderDto.cardExpiryDate),
    });

    return this.readerRepository.save(reader);
  }

  async findAll(query: FilterReaderDto): Promise<PaginationDto<Reader>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    const trimmed = search?.trim();

    const qb = this.readerRepository
      .createQueryBuilder('reader')
      .leftJoinAndSelect('reader.readerType', 'readerType')
      .leftJoinAndSelect('reader.user', 'user')
      .orderBy('reader.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (trimmed) {
      const term = `%${trimmed}%`;
      qb.where(
        '(reader.fullName ILIKE :term OR reader.phone ILIKE :term OR reader.cardNumber ILIKE :term OR reader.address ILIKE :term OR user.username ILIKE :term OR user.email ILIKE :term)',
        { term },
      );
    }

    const [data, totalItems] = await qb.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit) || 1;
    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { data, meta };
  }

  async findOne(id: string): Promise<Reader> {
    const reader = await this.readerRepository.findOne({
      where: { id },
      relations: ['readerType', 'user'],
    });

    if (!reader) {
      throw new NotFoundException('Không tìm thấy độc giả');
    }

    return reader;
  }

  async update(id: string, updateReaderDto: UpdateReaderDto): Promise<Reader> {
    const reader = await this.findOne(id);

    if (updateReaderDto.userId && updateReaderDto.userId !== reader.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateReaderDto.userId },
      });

      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      const existedByUser = await this.readerRepository.findOne({
        where: { userId: updateReaderDto.userId },
      });

      if (existedByUser) {
        throw new ConflictException('Người dùng này đã có hồ sơ độc giả');
      }
    }

    if (
      updateReaderDto.readerTypeId &&
      updateReaderDto.readerTypeId !== reader.readerTypeId
    ) {
      const readerType = await this.readerTypeRepository.findOne({
        where: { id: updateReaderDto.readerTypeId },
      });

      if (!readerType) {
        throw new BadRequestException('Loại độc giả không tồn tại');
      }
    }

    if (
      updateReaderDto.cardNumber &&
      updateReaderDto.cardNumber !== reader.cardNumber
    ) {
      const existedByCard = await this.readerRepository.findOne({
        where: { cardNumber: updateReaderDto.cardNumber },
      });

      if (existedByCard) {
        throw new ConflictException('Mã thẻ thư viện đã tồn tại');
      }
    }

    const merged = this.readerRepository.merge(reader, {
      ...updateReaderDto,
      ...(updateReaderDto.dob ? { dob: new Date(updateReaderDto.dob) } : {}),
      ...(updateReaderDto.cardIssueDate
        ? { cardIssueDate: new Date(updateReaderDto.cardIssueDate) }
        : {}),
      ...(updateReaderDto.cardExpiryDate
        ? { cardExpiryDate: new Date(updateReaderDto.cardExpiryDate) }
        : {}),
    });

    return this.readerRepository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const reader = await this.findOne(id);
    await this.readerRepository.remove(reader);
    return { message: 'Xóa độc giả thành công' };
  }

  async findByUserId(userId: string): Promise<Reader> {
    const reader = await this.readerRepository.findOne({
      where: { userId },
      relations: ['readerType', 'user'],
    });

    if (!reader) {
      throw new NotFoundException('Không tìm thấy độc giả với userId này');
    }

    return reader;
  }
}
