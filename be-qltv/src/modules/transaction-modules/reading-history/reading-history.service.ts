import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginationDto,
  PaginationMetaDto,
} from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { ReadingHistory } from './entities/reading-history.entity';
import { CreateReadingHistoryDto } from './dto/create-reading-history.dto';
import { UpdateReadingHistoryDto } from './dto/update-reading-history.dto';
import { FilterReadingHistoryDto } from './dto/filter-reading-history.dto';
import { Reader } from 'src/modules/user-modules/readers/entities/reader.entity';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';

@Injectable()
export class ReadingHistoryService {
  constructor(
    @InjectRepository(ReadingHistory)
    private readonly repository: Repository<ReadingHistory>,
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createDto: CreateReadingHistoryDto): Promise<ReadingHistory> {
    if (createDto.readerId) {
      const exists = await this.readerRepository.exist({
        where: { id: createDto.readerId },
      });
      if (!exists) throw new BadRequestException('Độc giả không tồn tại');
    }
    if (createDto.bookId) {
      const exists = await this.bookRepository.exist({
        where: { id: createDto.bookId },
      });
      if (!exists) throw new BadRequestException('Sách không tồn tại');
    }
    const item = this.repository.create(
      createDto as unknown as Partial<ReadingHistory>,
    );
    return this.repository.save(item);
  }

  async findAll(
    query: FilterReadingHistoryDto,
  ): Promise<PaginationDto<ReadingHistory>> {
    const { page = 1, limit = 10 } = query;
    const qb = this.repository.createQueryBuilder('entity');

    qb.orderBy('entity.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
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

  async findOne(id: string): Promise<ReadingHistory> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(
    id: string,
    updateDto: UpdateReadingHistoryDto,
  ): Promise<ReadingHistory> {
    const item = await this.findOne(id);
    if (updateDto.readerId !== undefined) {
      const exists = await this.readerRepository.exist({
        where: { id: updateDto.readerId },
      });
      if (!exists) throw new BadRequestException('Độc giả không tồn tại');
    }
    if (updateDto.bookId !== undefined) {
      const exists = await this.bookRepository.exist({
        where: { id: updateDto.bookId },
      });
      if (!exists) throw new BadRequestException('Sách không tồn tại');
    }
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<ReadingHistory>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
