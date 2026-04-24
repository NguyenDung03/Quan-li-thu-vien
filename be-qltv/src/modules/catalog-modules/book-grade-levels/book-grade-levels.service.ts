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
import { FilterBookGradeLevelDto } from './dto/filter-book-grade-level.dto';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { GradeLevel } from 'src/modules/catalog-modules/grade-levels/entities/grade-level.entity';
import { Repository } from 'typeorm';
import { CreateBookGradeLevelDto } from './dto/create-book-grade-level.dto';
import { UpdateBookGradeLevelDto } from './dto/update-book-grade-level.dto';
import { BookGradeLevel } from './entities/book-grade-level.entity';

@Injectable()
export class BookGradeLevelsService {
  constructor(
    @InjectRepository(BookGradeLevel)
    private readonly repository: Repository<BookGradeLevel>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(GradeLevel)
    private readonly gradeLevelRepository: Repository<GradeLevel>,
  ) {}

  async create(dto: CreateBookGradeLevelDto): Promise<BookGradeLevel> {
    const bookExists = await this.bookRepository.exist({
      where: { id: dto.bookId },
    });
    if (!bookExists) throw new BadRequestException('Sách không tồn tại');
    const gradeExists = await this.gradeLevelRepository.exist({
      where: { id: dto.gradeLevelId },
    });
    if (!gradeExists) throw new BadRequestException('Khối lớp không tồn tại');

    const existed = await this.repository.findOne({
      where: { bookId: dto.bookId, gradeLevelId: dto.gradeLevelId },
    });
    if (existed)
      throw new ConflictException('Liên kết sách - khối lớp đã tồn tại');

    return this.repository.save(this.repository.create(dto));
  }

  async findAll(
    query: FilterBookGradeLevelDto,
  ): Promise<PaginationDto<BookGradeLevel>> {
    const { page = 1, limit = 10, bookId } = query;
    const qb = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.gradeLevel', 'gradeLevel');
    if (bookId) {
      qb.andWhere('entity.book_id = :bookId', { bookId });
    }
    qb.orderBy('entity.book_id', 'ASC').addOrderBy(
      'entity.grade_level_id',
      'ASC',
    );
    qb.skip((page - 1) * limit).take(limit);
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

  async findOne(bookId: string, gradeLevelId: string): Promise<BookGradeLevel> {
    const item = await this.repository.findOne({
      where: { bookId, gradeLevelId },
    });
    if (!item)
      throw new NotFoundException('Không tìm thấy liên kết sách - khối lớp');
    return item;
  }

  async update(
    bookId: string,
    gradeLevelId: string,
    dto: UpdateBookGradeLevelDto,
  ): Promise<BookGradeLevel> {
    await this.findOne(bookId, gradeLevelId);

    const nextBookId = dto.bookId ?? bookId;
    const nextGradeLevelId = dto.gradeLevelId ?? gradeLevelId;

    const bookExists = await this.bookRepository.exist({
      where: { id: nextBookId },
    });
    if (!bookExists) throw new BadRequestException('Sách không tồn tại');
    const gradeExists = await this.gradeLevelRepository.exist({
      where: { id: nextGradeLevelId },
    });
    if (!gradeExists) throw new BadRequestException('Khối lớp không tồn tại');

    const conflict = await this.repository.findOne({
      where: { bookId: nextBookId, gradeLevelId: nextGradeLevelId },
    });
    if (
      conflict &&
      (nextBookId !== bookId || nextGradeLevelId !== gradeLevelId)
    ) {
      throw new ConflictException('Liên kết sách - khối lớp đã tồn tại');
    }

    await this.repository.delete({ bookId, gradeLevelId });
    return this.repository.save(
      this.repository.create({
        bookId: nextBookId,
        gradeLevelId: nextGradeLevelId,
      }),
    );
  }

  async remove(
    bookId: string,
    gradeLevelId: string,
  ): Promise<{ message: string }> {
    const item = await this.findOne(bookId, gradeLevelId);
    await this.repository.remove(item);
    return { message: 'Xóa liên kết thành công' };
  }
}
