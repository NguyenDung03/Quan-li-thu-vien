import { ApiProperty } from '@nestjs/swagger';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { GradeLevel } from 'src/modules/catalog-modules/grade-levels/entities/grade-level.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('book_grade_levels')
export class BookGradeLevel {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách',
  })
  @PrimaryColumn('uuid', { name: 'book_id' })
  bookId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID khối lớp',
  })
  @PrimaryColumn('uuid', { name: 'grade_level_id' })
  gradeLevelId: string;

  @ManyToOne(() => Book, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => GradeLevel, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grade_level_id' })
  gradeLevel: GradeLevel;
}
