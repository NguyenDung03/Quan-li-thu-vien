import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginationDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { CreateReaderTypeDto } from './dto/create-reader-type.dto';
import { UpdateReaderTypeDto } from './dto/update-reader-type.dto';
import { ReaderType } from './entities/reader-type.entity';

@Injectable()
export class ReaderTypesService {
  constructor(
    @InjectRepository(ReaderType)
    private readonly readerTypeRepository: Repository<ReaderType>,
  ) {}

  async create(createReaderTypeDto: CreateReaderTypeDto): Promise<ReaderType> {
    const existed = await this.readerTypeRepository.findOne({
      where: { typeName: createReaderTypeDto.typeName },
    });

    if (existed) {
      throw new ConflictException('Loại độc giả đã tồn tại');
    }

    const readerType = this.readerTypeRepository.create(createReaderTypeDto);
    return this.readerTypeRepository.save(readerType);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginationDto<ReaderType>> {
    const { page = 1, limit = 10 } = query;
    const [data, totalItems] = await this.readerTypeRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

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

  async findOne(id: string): Promise<ReaderType> {
    const readerType = await this.readerTypeRepository.findOne({
      where: { id },
    });
    if (!readerType) {
      throw new NotFoundException('Không tìm thấy loại độc giả');
    }

    return readerType;
  }

  async update(
    id: string,
    updateReaderTypeDto: UpdateReaderTypeDto,
  ): Promise<ReaderType> {
    const readerType = await this.findOne(id);

    if (
      updateReaderTypeDto.typeName &&
      updateReaderTypeDto.typeName !== readerType.typeName
    ) {
      const existed = await this.readerTypeRepository.findOne({
        where: { typeName: updateReaderTypeDto.typeName },
      });

      if (existed) {
        throw new ConflictException('Loại độc giả đã tồn tại');
      }
    }

    const updated = this.readerTypeRepository.merge(
      readerType,
      updateReaderTypeDto,
    );
    return this.readerTypeRepository.save(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const readerType = await this.findOne(id);
    await this.readerTypeRepository.remove(readerType);
    return { message: 'Xóa loại độc giả thành công' };
  }
}
