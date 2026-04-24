import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginationDto,
  PaginationMetaDto,
} from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { FilterAuthorDto } from './dto/filter-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly repository: Repository<Author>,
  ) {}

  async create(createDto: CreateAuthorDto): Promise<Author> {
    const item = this.repository.create(
      createDto as unknown as Partial<Author>,
    );
    return this.repository.save(item);
  }

  async findAll(query: FilterAuthorDto): Promise<PaginationDto<Author>> {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repository.createQueryBuilder('entity');
    if (search && search.trim()) {
      qb.where(
        'entity.authorName ILIKE :search OR entity.nationality ILIKE :search',
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

  async findOne(id: string): Promise<Author> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(id: string, updateDto: UpdateAuthorDto): Promise<Author> {
    const item = await this.findOne(id);
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<Author>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
