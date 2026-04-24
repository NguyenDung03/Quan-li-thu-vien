import {
  ConflictException,
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
import { BookCategory } from './entities/book-category.entity';
import { CreateBookCategoryDto } from './dto/create-book-category.dto';
import { UpdateBookCategoryDto } from './dto/update-book-category.dto';
import { FilterBookCategoryDto } from './dto/filter-book-category.dto';

@Injectable()
export class BookCategoriesService {
  constructor(
    @InjectRepository(BookCategory)
    private readonly repository: Repository<BookCategory>,
    @InjectRepository(BookCategory)
    private readonly bookCategoryRepository: Repository<BookCategory>,
  ) {}

  async create(createDto: CreateBookCategoryDto): Promise<BookCategory> {
    const existedByName = await this.repository.findOne({
      where: { name: createDto.name },
    });
    if (existedByName) throw new ConflictException('Giá trị name đã tồn tại');
    if (createDto.parentId !== undefined) {
      const exists = await this.bookCategoryRepository.exist({
        where: { id: createDto.parentId },
      });
      if (!exists) throw new BadRequestException('Danh mục cha không tồn tại');
    }
    const item = this.repository.create(
      createDto as unknown as Partial<BookCategory>,
    );
    return this.repository.save(item);
  }

  async findAll(
    query: FilterBookCategoryDto,
  ): Promise<PaginationDto<BookCategory>> {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repository.createQueryBuilder('entity');
    if (search && search.trim()) {
      qb.where('entity.name ILIKE :search', { search: `%${search.trim()}%` });
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

  async findOne(id: string): Promise<BookCategory> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(
    id: string,
    updateDto: UpdateBookCategoryDto,
  ): Promise<BookCategory> {
    const item = await this.findOne(id);
    if (updateDto.name !== undefined && updateDto.name !== item.name) {
      const existedByName = await this.repository.findOne({
        where: { name: updateDto.name },
      });
      if (existedByName) throw new ConflictException('Giá trị name đã tồn tại');
    }
    if (updateDto.parentId !== undefined) {
      const exists = await this.bookCategoryRepository.exist({
        where: { id: updateDto.parentId },
      });
      if (!exists) throw new BadRequestException('Danh mục cha không tồn tại');
    }
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<BookCategory>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
