import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';
import { BookType } from 'src/common/enums/book-type.enum';
import { PhysicalBookType } from 'src/common/enums/physical-book-type.enum';

import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BookCategory } from 'src/modules/catalog-modules/book-categories/entities/book-category.entity';

import { Image } from 'src/modules/media-modules/images/entities/image.entity';

import { Publisher } from 'src/modules/catalog-modules/publishers/entities/publisher.entity';

import { PhysicalCopy } from 'src/modules/inventory-modules/physical-copies/entities/physical-copy.entity';
import { BookAuthor } from 'src/modules/catalog-modules/book-authors/entities/book-author.entity';
import { BookGradeLevel } from 'src/modules/catalog-modules/book-grade-levels/entities/book-grade-level.entity';

@Entity('books')
export class Book extends BaseEntity {
  @ApiProperty({
    example: 'Tôi thấy hoa vàng trên cỏ xanh',
    description: 'Tiêu đề',
  })
  @Column()
  title: string;

  @ApiProperty({ example: '9786041234567', description: 'ISBN' })
  @Column({ unique: true })
  isbn: string;

  @ApiProperty({ example: 2024, description: 'Năm xuất bản' })
  @Column({ name: 'publish_year', type: 'int' })
  publishYear: number;

  @ApiProperty({ example: 'Tái bản 2', description: 'Phiên bản' })
  @Column({ nullable: false })
  edition: string;

  @ApiProperty({ example: 'Mô tả sách', description: 'Mô tả' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID ảnh bìa (nếu lưu trong hệ thống)',
  })
  @Column({ name: 'cover_image_id', nullable: true })
  coverImageId: string;

  @ApiProperty({
    example: 'https://example.com/images/book-cover.jpg',
    description: 'URL ảnh bìa (nếu sử dụng link bên ngoài)',
  })
  @Column({ name: 'cover_image', type: 'text', nullable: true })
  coverImage: string;

  @ApiProperty({ example: 'vi', description: 'Ngôn ngữ' })
  @Column({ default: 'vi' })
  language: string;

  @ApiProperty({ example: 250, description: 'Số trang' })
  @Column({ name: 'page_count', type: 'int' })
  pageCount: number;

  @ApiProperty({
    enum: BookType,
    example: BookType.PHYSICAL,
    description: 'Loại sách (ebook hoặc physical)',
  })
  @Column({
    name: 'book_type',
    type: 'enum',
    enum: BookType,
    default: BookType.PHYSICAL,
  })
  bookType: BookType;

  @ApiProperty({
    enum: PhysicalBookType,
    example: PhysicalBookType.BORROWABLE,
    description: 'Loại sách vật lý (chỉ đọc tại thư viện hoặc mượn về)',
    required: false,
  })
  @Column({
    name: 'physical_type',
    type: 'enum',
    enum: PhysicalBookType,
    nullable: true,
  })
  physicalType: PhysicalBookType;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID nhà xuất bản',
  })
  @Column({ name: 'publisher_id' })
  publisherId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID danh mục chính',
  })
  @Column({ name: 'main_category_id' })
  mainCategoryId: string;

  @ManyToOne(() => Publisher, { nullable: false })
  @JoinColumn({ name: 'publisher_id' })
  publisher: Publisher;

  @ManyToOne(() => BookCategory, { nullable: false })
  @JoinColumn({ name: 'main_category_id' })
  mainCategory: BookCategory;

  @ManyToOne(() => Image, { nullable: true })
  @JoinColumn({ name: 'cover_image_id' })
  coverImageEntity: Image;

  @OneToMany(() => PhysicalCopy, (physicalCopy) => physicalCopy.book)
  physicalCopies: PhysicalCopy[];

  @OneToMany(() => BookAuthor, (bookAuthor) => bookAuthor.book)
  bookAuthors: BookAuthor[];

  @OneToMany(() => BookGradeLevel, (bookGradeLevel) => bookGradeLevel.book)
  bookGradeLevels: BookGradeLevel[];

  @ApiPropertyOptional({
    example: 10,
    description:
      'Tổng số bản in vật lý (không lưu trữ). Chỉ có trong GET chi tiết sách.',
  })
  physicalCopiesTotalCount?: number;

  @ApiPropertyOptional({
    example: 8,
    description:
      'Số bản trạng thái available (khả dụng). Chỉ có trong GET chi tiết sách.',
  })
  physicalCopiesAvailableCount?: number;

  @ApiPropertyOptional({
    example: 120000,
    description:
      'Giá tham chiếu bản vật lý (price hoặc purchase_price trên một bản). Chỉ trong GET chi tiết.',
  })
  physicalCopyPrice?: number;
}
