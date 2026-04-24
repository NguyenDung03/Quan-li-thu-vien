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
import { Repository, DataSource, QueryRunner, In } from 'typeorm';
import { randomUUID } from 'crypto';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBookDto } from './dto/filter-book.dto';
import { Publisher } from 'src/modules/catalog-modules/publishers/entities/publisher.entity';
import { BookCategory } from 'src/modules/catalog-modules/book-categories/entities/book-category.entity';
import { Image } from 'src/modules/media-modules/images/entities/image.entity';
import { PhysicalCopy } from 'src/modules/inventory-modules/physical-copies/entities/physical-copy.entity';
import { Ebook } from 'src/modules/inventory-modules/ebooks/entities/ebook.entity';
import { Location } from 'src/modules/inventory-modules/locations/entities/location.entity';
import { Upload } from 'src/modules/media-modules/uploads/entities/upload.entity';
import { BookAuthor } from 'src/modules/catalog-modules/book-authors/entities/book-author.entity';
import { BookGradeLevel } from 'src/modules/catalog-modules/book-grade-levels/entities/book-grade-level.entity';
import { BookType } from 'src/common/enums/book-type.enum';
import { PhysicalBookType } from 'src/common/enums/physical-book-type.enum';
import { PhysicalCopyStatus } from 'src/common/enums/physical-copy-status.enum';
import { PhysicalCopyCondition } from 'src/common/enums/physical-copy-condition.enum';
import { BorrowRecord } from 'src/modules/transaction-modules/borrow-records/entities/borrow-record.entity';
import { Reservation } from 'src/modules/transaction-modules/reservations/entities/reservation.entity';
import { Fine } from 'src/modules/transaction-modules/fines/entities/fine.entity';
import { ReadingHistory } from 'src/modules/transaction-modules/reading-history/entities/reading-history.entity';
import { physicalCopyFineReferencePrice } from 'src/common/utils/physical-copy-fine.util';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    @InjectRepository(BookCategory)
    private readonly bookCategoryRepository: Repository<BookCategory>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(PhysicalCopy)
    private readonly physicalCopyRepository: Repository<PhysicalCopy>,
    @InjectRepository(Ebook)
    private readonly ebookRepository: Repository<Ebook>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
    @InjectRepository(BookAuthor)
    private readonly bookAuthorRepository: Repository<BookAuthor>,
    @InjectRepository(BookGradeLevel)
    private readonly bookGradeLevelRepository: Repository<BookGradeLevel>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateBookDto): Promise<Book> {
    const existedByIsbn = await this.bookRepository.findOne({
      where: { isbn: createDto.isbn },
    });
    if (existedByIsbn) throw new ConflictException('Giá trị isbn đã tồn tại');

    if (createDto.publisherId) {
      const exists = await this.publisherRepository.exist({
        where: { id: createDto.publisherId },
      });
      if (!exists) throw new BadRequestException('Nhà xuất bản không tồn tại');
    }

    if (createDto.mainCategoryId) {
      const exists = await this.bookCategoryRepository.exist({
        where: { id: createDto.mainCategoryId },
      });
      if (!exists)
        throw new BadRequestException('Danh mục chính không tồn tại');
    }

    if (createDto.coverImageId !== undefined) {
      const exists = await this.imageRepository.exist({
        where: { id: createDto.coverImageId },
      });
      if (!exists) throw new BadRequestException('Ảnh bìa không tồn tại');
    }

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        authorIds,
        gradeLevelIds,
        physicalCopiesQuantity: _pq,
        uploadId: _up,
        defaultLocationCode: _dlc,
        physicalCopyPrice: _pcp,
        ...bookData
      } = createDto;
      void _pq;
      void _up;
      void _dlc;
      void _pcp;
      const book = this.bookRepository.create(
        bookData as unknown as Partial<Book>,
      );
      const savedBook = await queryRunner.manager.save(Book, book);

      if (authorIds && authorIds.length > 0) {
        const bookAuthors = authorIds.map((authorId) =>
          this.bookAuthorRepository.create({
            bookId: savedBook.id,
            authorId,
          }),
        );
        await queryRunner.manager.save(BookAuthor, bookAuthors);
      }

      if (gradeLevelIds && gradeLevelIds.length > 0) {
        const bookGradeLevels = gradeLevelIds.map((gradeLevelId) =>
          this.bookGradeLevelRepository.create({
            bookId: savedBook.id,
            gradeLevelId,
          }),
        );
        await queryRunner.manager.save(BookGradeLevel, bookGradeLevels);
      }

      if (
        createDto.bookType === BookType.PHYSICAL &&
        createDto.physicalType === PhysicalBookType.BORROWABLE &&
        createDto.physicalCopiesQuantity &&
        createDto.physicalCopiesQuantity > 0
      ) {
        await this.createPhysicalCopiesWithRunner(
          queryRunner,
          savedBook.id,
          createDto.physicalCopiesQuantity,
          createDto.defaultLocationCode,
          createDto.physicalCopyPrice,
        );
      }

      if (createDto.bookType === BookType.EBOOK && createDto.uploadId) {
        await this.createEbookRecordWithRunner(
          queryRunner,
          savedBook.id,
          createDto.uploadId,
        );
      }

      await queryRunner.commitTransaction();
      return savedBook;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createPhysicalCopiesWithRunner(
    queryRunner: QueryRunner,
    bookId: string,
    quantity: number,
    defaultLocationCode?: string,
    copyPrice?: number,
  ): Promise<void> {
    let location: Location | null = null;
    if (defaultLocationCode) {
      location = await this.locationRepository.findOne({
        where: { slug: defaultLocationCode.toLowerCase() },
      });
    }

    if (!location) {
      location = await this.locationRepository.findOne({
        where: { isActive: true },
      });
    }

    if (!location) {
      throw new BadRequestException(
        'Không tìm thấy vị trí lưu trữ. Vui lòng tạo vị trí trước.',
      );
    }

    const copies: Partial<PhysicalCopy>[] = [];
    for (let i = 0; i < quantity; i++) {
      const shortUuid = randomUUID()
        .replace(/-/g, '')
        .substring(0, 8)
        .toUpperCase();
      copies.push({
        bookId: bookId,
        barcode: `BC-${shortUuid}`,
        status: PhysicalCopyStatus.AVAILABLE,
        currentCondition: PhysicalCopyCondition.GOOD,
        locationId: location.id,
        ...(copyPrice != null &&
        Number.isFinite(Number(copyPrice)) &&
        Number(copyPrice) >= 0
          ? { price: Number(copyPrice) }
          : {}),
      });
    }

    await queryRunner.manager.save(PhysicalCopy, copies);
  }

  private async createEbookRecordWithRunner(
    queryRunner: QueryRunner,
    bookId: string,
    uploadId: string,
  ): Promise<void> {
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new BadRequestException('File upload không tồn tại');
    }

    const ebook = this.ebookRepository.create({
      bookId: bookId,
      filePath: upload.filePath,
      fileSize: upload.fileSize,
      fileFormat: upload.fileFormat,
      downloadCount: 0,
    });

    await queryRunner.manager.save(Ebook, ebook);
  }

  async findAll(query: FilterBookDto): Promise<PaginationDto<Book>> {
    const {
      page = 1,
      limit = 10,
      search,
      bookType,
      physicalType,
      availablePhysical,
    } = query;
    const qb = this.bookRepository.createQueryBuilder('entity');

    if (search && search.trim()) {
      qb.where(
        'entity.title ILIKE :search OR entity.isbn ILIKE :search OR entity.language ILIKE :search',
        { search: `%${search.trim()}%` },
      );
    }

    if (bookType) {
      qb.andWhere('entity.book_type = :bookType', { bookType });
    }

    if (physicalType) {
      qb.andWhere('entity.book_type = :bookTypePhysical', {
        bookTypePhysical: BookType.PHYSICAL,
      });
      qb.andWhere('entity.physical_type = :physicalType', { physicalType });
    }

    if (availablePhysical === 'true') {
      qb.andWhere('entity.book_type = :bookTypePhys', {
        bookTypePhys: BookType.PHYSICAL,
      });
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM physical_copies pc
          WHERE pc.book_id = entity.id
          AND pc.status = :availableStatus
        )`,
        { availableStatus: PhysicalCopyStatus.AVAILABLE },
      );
    }

    qb.loadRelationCountAndMap(
      'availableCopies',
      'entity.physicalCopies',
      'pc',
      (qb) =>
        qb.andWhere('pc.status = :status', {
          status: PhysicalCopyStatus.AVAILABLE,
        }),
    );

    qb.leftJoinAndSelect('entity.publisher', 'publisher');
    qb.leftJoinAndSelect('entity.coverImageEntity', 'coverImageEntity');
    qb.leftJoinAndSelect('entity.mainCategory', 'mainCategory');
    qb.leftJoinAndSelect('entity.bookGradeLevels', 'bookGradeLevels');
    qb.leftJoinAndSelect('bookGradeLevels.gradeLevel', 'bookGradeLevelsGrade');
    qb.distinct(true);

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

  async findOne(id: string): Promise<Book> {
    const item = await this.bookRepository.findOne({
      where: { id },
      relations: [
        'publisher',
        'mainCategory',
        'coverImageEntity',
        'bookAuthors',
        'bookAuthors.author',
        'bookGradeLevels',
        'bookGradeLevels.gradeLevel',
      ],
    });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');

    const [physicalCopiesTotalCount, physicalCopiesAvailableCount] =
      await Promise.all([
        this.physicalCopyRepository.count({
          where: { bookId: id, isArchived: false },
        }),
        this.physicalCopyRepository.count({
          where: {
            bookId: id,
            isArchived: false,
            status: PhysicalCopyStatus.AVAILABLE,
          },
        }),
      ]);

    const refCopy = await this.physicalCopyRepository.findOne({
      where: { bookId: id, isArchived: false },
      order: { created_at: 'ASC' },
      select: ['price', 'purchasePrice'],
    });
    const physicalCopyPrice = refCopy
      ? (physicalCopyFineReferencePrice(refCopy) ?? undefined)
      : undefined;

    Object.assign(item, {
      physicalCopiesTotalCount,
      physicalCopiesAvailableCount,
      physicalCopyPrice,
    });

    return item;
  }

  async update(id: string, updateDto: UpdateBookDto): Promise<Book> {
    const item = await this.findOne(id);
    if (updateDto.isbn !== undefined && updateDto.isbn !== item.isbn) {
      const existedByIsbn = await this.bookRepository.findOne({
        where: { isbn: updateDto.isbn },
      });
      if (existedByIsbn) throw new ConflictException('Giá trị isbn đã tồn tại');
    }
    if (updateDto.publisherId !== undefined) {
      const exists = await this.publisherRepository.exist({
        where: { id: updateDto.publisherId },
      });
      if (!exists) throw new BadRequestException('Nhà xuất bản không tồn tại');
    }
    if (updateDto.mainCategoryId !== undefined) {
      const exists = await this.bookCategoryRepository.exist({
        where: { id: updateDto.mainCategoryId },
      });
      if (!exists)
        throw new BadRequestException('Danh mục chính không tồn tại');
    }
    if (updateDto.coverImageId !== undefined) {
      const exists = await this.imageRepository.exist({
        where: { id: updateDto.coverImageId },
      });
      if (!exists) throw new BadRequestException('Ảnh bìa không tồn tại');
    }

    const {
      authorIds,
      gradeLevelIds,
      physicalCopyPrice,
      physicalCopiesQuantity: _qty,
      uploadId: _uploadId,
      defaultLocationCode: _defaultLoc,
      ...restUpdateData
    } = updateDto;
    void _qty;
    void _uploadId;
    void _defaultLoc;

    const merged = this.bookRepository.merge(
      item,
      restUpdateData as unknown as Partial<Book>,
    );
    const savedBook = await this.bookRepository.save(merged);

    if (
      physicalCopyPrice !== undefined &&
      savedBook.bookType === BookType.PHYSICAL
    ) {
      await this.physicalCopyRepository.update(
        { bookId: id, isArchived: false },
        { price: physicalCopyPrice },
      );
    }

    if (authorIds !== undefined) {
      await this.bookAuthorRepository.delete({ bookId: id });
      if (authorIds.length > 0) {
        const bookAuthors = authorIds.map((authorId) =>
          this.bookAuthorRepository.create({
            bookId: id,
            authorId,
          }),
        );
        await this.bookAuthorRepository.save(bookAuthors);
      }
    }

    if (gradeLevelIds !== undefined) {
      await this.bookGradeLevelRepository.delete({ bookId: id });
      if (gradeLevelIds.length > 0) {
        const bookGradeLevels = gradeLevelIds.map((gradeLevelId) =>
          this.bookGradeLevelRepository.create({
            bookId: id,
            gradeLevelId,
          }),
        );
        await this.bookGradeLevelRepository.save(bookGradeLevels);
      }
    }

    return savedBook;
  }

  private physicalCopyStatusLabelVi(status: PhysicalCopyStatus): string {
    const labels: Record<PhysicalCopyStatus, string> = {
      [PhysicalCopyStatus.AVAILABLE]: 'có sẵn (available)',
      [PhysicalCopyStatus.BORROWED]: 'đang mượn',
      [PhysicalCopyStatus.RESERVED]: 'đặt trước',
      [PhysicalCopyStatus.DAMAGED]: 'hư hỏng',
      [PhysicalCopyStatus.LOST]: 'mất',
      [PhysicalCopyStatus.MAINTENANCE]: 'bảo trì',
    };
    return labels[status] ?? String(status);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);

    const copies = await this.physicalCopyRepository.find({
      where: { bookId: id },
      select: ['id', 'status', 'barcode'],
    });

    const blocked = copies.filter(
      (c) => c.status !== PhysicalCopyStatus.AVAILABLE,
    );
    if (blocked.length > 0) {
      const counts = new Map<PhysicalCopyStatus, number>();
      for (const c of blocked) {
        counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
      }
      const detail = [...counts.entries()]
        .map(([st, n]) => `${n} bản ${this.physicalCopyStatusLabelVi(st)}`)
        .join('; ');
      throw new BadRequestException(
        `Không thể xóa sách: còn ${blocked.length} bản vật lý không ở trạng thái có sẵn - Gồm: ${detail}. Vui lòng xử lý các bản sao (hoàn tất mượn/trả, cập nhật trạng thái, v.v.) trước khi xóa.`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const copyIds = copies.map((c) => c.id);

      if (copyIds.length > 0) {
        const borrowRows = await queryRunner.manager.find(BorrowRecord, {
          where: { copyId: In(copyIds) },
          select: ['id'],
        });
        const borrowIds = borrowRows.map((r) => r.id);
        if (borrowIds.length > 0) {
          await queryRunner.manager.delete(Fine, { borrowId: In(borrowIds) });
        }
        await queryRunner.manager.delete(BorrowRecord, { copyId: In(copyIds) });
        await queryRunner.manager.delete(PhysicalCopy, { bookId: id });
      }

      await queryRunner.manager.delete(Reservation, { bookId: id });
      await queryRunner.manager.delete(ReadingHistory, { bookId: id });
      await queryRunner.manager.delete(Ebook, { bookId: id });
      await queryRunner.manager.delete(BookAuthor, { bookId: id });
      await queryRunner.manager.delete(BookGradeLevel, { bookId: id });

      await queryRunner.manager.remove(Book, item);

      await queryRunner.commitTransaction();
      return { message: 'Xóa dữ liệu thành công' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
