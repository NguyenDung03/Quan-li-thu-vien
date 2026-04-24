import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginationDto,
  PaginationMetaDto,
} from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationDto } from './dto/filter-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
  ) {}

  async create(createDto: CreateLocationDto): Promise<Location> {
    const existedBySlug = await this.repository.findOne({
      where: { slug: createDto.slug },
    });
    if (existedBySlug) throw new ConflictException('Giá trị slug đã tồn tại');
    const item = this.repository.create(
      createDto as unknown as Partial<Location>,
    );
    return this.repository.save(item);
  }

  async findAll(query: FilterLocationDto): Promise<PaginationDto<Location>> {
    const { page = 1, limit = 10, search, isActive } = query;
    const qb = this.repository.createQueryBuilder('entity');
    if (search && search.trim()) {
      qb.where(
        'entity.name ILIKE :search OR entity.slug ILIKE :search OR entity.section ILIKE :search OR entity.shelf ILIKE :search',
        { search: `%${search.trim()}%` },
      );
    }
    if (isActive !== undefined && isActive !== null) {
      qb.andWhere('entity.is_active = :isActive', { isActive });
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

  async findOne(id: string): Promise<Location> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(id: string, updateDto: UpdateLocationDto): Promise<Location> {
    const item = await this.findOne(id);
    if (updateDto.slug !== undefined && updateDto.slug !== item.slug) {
      const existedBySlug = await this.repository.findOne({
        where: { slug: updateDto.slug },
      });
      if (existedBySlug) throw new ConflictException('Giá trị slug đã tồn tại');
    }
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<Location>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
