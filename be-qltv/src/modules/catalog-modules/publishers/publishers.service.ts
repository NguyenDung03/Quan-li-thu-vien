import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginationDto,
  PaginationMetaDto,
} from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { Publisher } from './entities/publisher.entity';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { FilterPublisherDto } from './dto/filter-publisher.dto';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private readonly repository: Repository<Publisher>,
  ) {}

  async create(createDto: CreatePublisherDto): Promise<Publisher> {
    const item = this.repository.create(
      createDto as unknown as Partial<Publisher>,
    );
    return this.repository.save(item);
  }

  async findAll(query: FilterPublisherDto): Promise<PaginationDto<Publisher>> {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repository.createQueryBuilder('entity');
    if (search && search.trim()) {
      qb.where(
        'entity.publisherName ILIKE :search OR entity.email ILIKE :search',
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

  async findOne(id: string): Promise<Publisher> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(id: string, updateDto: UpdatePublisherDto): Promise<Publisher> {
    const item = await this.findOne(id);
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<Publisher>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
