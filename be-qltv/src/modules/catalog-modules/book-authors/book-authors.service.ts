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
import { BookAuthor } from './entities/book-author.entity';
import { CreateBookAuthorDto } from './dto/create-book-author.dto';
import { UpdateBookAuthorDto } from './dto/update-book-author.dto';
import { FilterBookAuthorDto } from './dto/filter-book-author.dto';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { Author } from 'src/modules/catalog-modules/authors/entities/author.entity';

@Injectable()
export class BookAuthorsService {
  constructor(
    @InjectRepository(BookAuthor)
    private readonly repository: Repository<BookAuthor>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async create(createDto: CreateBookAuthorDto): Promise<BookAuthor> {
    if (createDto.bookId) {
      const exists = await this.bookRepository.exist({
        where: { id: createDto.bookId },
      });
      if (!exists) throw new BadRequestException('Sách không tồn tại');
    }
    if (createDto.authorId) {
      const exists = await this.authorRepository.exist({
        where: { id: createDto.authorId },
      });
      if (!exists) throw new BadRequestException('Tác giả không tồn tại');
    }
    const item = this.repository.create(
      createDto as unknown as Partial<BookAuthor>,
    );
    return this.repository.save(item);
  }

  async findAll(
    query: FilterBookAuthorDto,
  ): Promise<PaginationDto<BookAuthor>> {
    const { page = 1, limit = 10, bookId, search } = query;
    const qb = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.author', 'author');

    if (bookId) {
      qb.andWhere('entity.book_id = :bookId', { bookId });
    }
    if (search && search.trim()) {
      qb.andWhere('author.authorName ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

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

  async findOne(id: string): Promise<BookAuthor> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(
    id: string,
    updateDto: UpdateBookAuthorDto,
  ): Promise<BookAuthor> {
    const item = await this.findOne(id);
    if (updateDto.bookId !== undefined) {
      const exists = await this.bookRepository.exist({
        where: { id: updateDto.bookId },
      });
      if (!exists) throw new BadRequestException('Sách không tồn tại');
    }
    if (updateDto.authorId !== undefined) {
      const exists = await this.authorRepository.exist({
        where: { id: updateDto.authorId },
      });
      if (!exists) throw new BadRequestException('Tác giả không tồn tại');
    }
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<BookAuthor>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
