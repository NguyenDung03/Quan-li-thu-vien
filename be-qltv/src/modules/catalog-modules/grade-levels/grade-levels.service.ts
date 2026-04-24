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
import { GradeLevel } from './entities/grade-level.entity';
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { UpdateGradeLevelDto } from './dto/update-grade-level.dto';
import { FilterGradeLevelDto } from './dto/filter-grade-level.dto';

@Injectable()
export class GradeLevelsService {
  constructor(
    @InjectRepository(GradeLevel)
    private readonly repository: Repository<GradeLevel>,
  ) {}

  async create(createDto: CreateGradeLevelDto): Promise<GradeLevel> {
    const existedByName = await this.repository.findOne({
      where: { name: createDto.name },
    });
    if (existedByName) throw new ConflictException('Giá trị name đã tồn tại');
    const item = this.repository.create(
      createDto as unknown as Partial<GradeLevel>,
    );
    return this.repository.save(item);
  }

  async findAll(
    query: FilterGradeLevelDto,
  ): Promise<PaginationDto<GradeLevel>> {
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

  async findOne(id: string): Promise<GradeLevel> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(
    id: string,
    updateDto: UpdateGradeLevelDto,
  ): Promise<GradeLevel> {
    const item = await this.findOne(id);
    if (updateDto.name !== undefined && updateDto.name !== item.name) {
      const existedByName = await this.repository.findOne({
        where: { name: updateDto.name },
      });
      if (existedByName) throw new ConflictException('Giá trị name đã tồn tại');
    }
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<GradeLevel>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
