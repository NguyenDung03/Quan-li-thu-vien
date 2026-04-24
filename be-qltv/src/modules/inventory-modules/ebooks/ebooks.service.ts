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
import { Ebook } from './entities/ebook.entity';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import { FilterEbookDto } from './dto/filter-ebook.dto';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';

@Injectable()
export class EbooksService {
  constructor(
    @InjectRepository(Ebook)
    private readonly repository: Repository<Ebook>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createDto: CreateEbookDto): Promise<Ebook> {
    if (createDto.bookId) {
      const exists = await this.bookRepository.exist({
        where: { id: createDto.bookId },
      });
      if (!exists) throw new BadRequestException('Sách không tồn tại');
    }
    const item = this.repository.create(createDto as unknown as Partial<Ebook>);
    return this.repository.save(item);
  }

  async findAll(query: FilterEbookDto): Promise<PaginationDto<Ebook>> {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.book', 'book')
      .leftJoinAndSelect('book.coverImageEntity', 'bookCoverImage');
    if (search && search.trim()) {
      qb.andWhere(
        'entity.filePath ILIKE :search OR entity.fileFormat ILIKE :search OR book.title ILIKE :search',
        { search: `%${search.trim()}%` },
      );
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

  async findOne(id: string): Promise<Ebook> {
    const item = await this.repository.findOne({
      where: { id },
      relations: ['book', 'book.coverImageEntity'],
    });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async findByBookId(bookId: string): Promise<Ebook> {
    const item = await this.repository.findOne({
      where: { bookId },
      relations: ['book', 'book.coverImageEntity'],
    });
    if (!item)
      throw new NotFoundException('Không tìm thấy sách điện tử cho sách này');
    return item;
  }

  async incrementDownloadCount(id: string): Promise<Ebook> {
    const item = await this.findOne(id);
    item.downloadCount = (item.downloadCount || 0) + 1;
    return this.repository.save(item);
  }

  async update(id: string, updateDto: UpdateEbookDto): Promise<Ebook> {
    const item = await this.findOne(id);
    if (updateDto.bookId !== undefined) {
      const exists = await this.bookRepository.exist({
        where: { id: updateDto.bookId },
      });
      if (!exists) throw new BadRequestException('Sách không tồn tại');
    }
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<Ebook>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
