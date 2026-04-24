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
import { PhysicalCopy } from './entities/physical-copy.entity';
import { CreatePhysicalCopyDto } from './dto/create-physical-copy.dto';
import { UpdatePhysicalCopyDto } from './dto/update-physical-copy.dto';
import { FilterPhysicalCopyDto } from './dto/filter-physical-copy.dto';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { Location } from 'src/modules/inventory-modules/locations/entities/location.entity';

@Injectable()
export class PhysicalCopiesService {
  constructor(
    @InjectRepository(PhysicalCopy)
    private readonly repository: Repository<PhysicalCopy>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createDto: CreatePhysicalCopyDto): Promise<PhysicalCopy> {
    const existedByBarcode = await this.repository.findOne({
      where: { barcode: createDto.barcode },
    });
    if (existedByBarcode)
      throw new ConflictException('Giá trị barcode đã tồn tại');
    if (createDto.bookId) {
      const exists = await this.bookRepository.exist({
        where: { id: createDto.bookId },
      });
      if (!exists) throw new BadRequestException('Sách không tồn tại');
    }
    if (createDto.locationId) {
      const exists = await this.locationRepository.exist({
        where: { id: createDto.locationId },
      });
      if (!exists) throw new BadRequestException('Vị trí không tồn tại');
    }
    const item = this.repository.create(
      createDto as unknown as Partial<PhysicalCopy>,
    );
    return this.repository.save(item);
  }

  async findAll(
    query: FilterPhysicalCopyDto,
  ): Promise<PaginationDto<PhysicalCopy>> {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.book', 'book')
      .leftJoinAndSelect('book.coverImageEntity', 'bookCoverImage')
      .leftJoinAndSelect('entity.location', 'location');
    if (search && search.trim()) {
      qb.where(
        'entity.barcode ILIKE :search OR entity.status ILIKE :search OR entity.currentCondition ILIKE :search OR book.title ILIKE :search OR location.name ILIKE :search',
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

  async findOne(id: string): Promise<PhysicalCopy> {
    const item = await this.repository.findOne({
      where: { id },
      relations: ['book', 'book.coverImageEntity', 'location'],
    });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(
    id: string,
    updateDto: UpdatePhysicalCopyDto,
  ): Promise<PhysicalCopy> {
    const item = await this.findOne(id);
    if (updateDto.barcode !== undefined && updateDto.barcode !== item.barcode) {
      const existedByBarcode = await this.repository.findOne({
        where: { barcode: updateDto.barcode },
      });
      if (existedByBarcode)
        throw new ConflictException('Giá trị barcode đã tồn tại');
    }
    if (updateDto.bookId !== undefined) {
      const exists = await this.bookRepository.exist({
        where: { id: updateDto.bookId },
      });
      if (!exists) throw new BadRequestException('Sách không tồn tại');
    }
    if (updateDto.locationId !== undefined) {
      const exists = await this.locationRepository.exist({
        where: { id: updateDto.locationId },
      });
      if (!exists) throw new BadRequestException('Vị trí không tồn tại');
    }
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<PhysicalCopy>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
