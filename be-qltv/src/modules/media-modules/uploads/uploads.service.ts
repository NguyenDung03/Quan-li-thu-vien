import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'node:path';
import {
  PaginationDto,
  PaginationMetaDto,
} from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { Upload } from './entities/upload.entity';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { FilterUploadDto } from './dto/filter-upload.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

const DOCUMENT_MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/epub+zip': 'epub',
  'application/x-mobipocket-ebook': 'mobi',
};

const ALLOWED_DOCUMENT_MIMES = Object.keys(DOCUMENT_MIME_TO_EXT);

function parseFilenameExtension(originalname: string): string | null {
  const dotted = path.extname(originalname);
  if (dotted.length <= 1) {
    return null;
  }
  const ext = dotted.slice(1).toLowerCase();
  if (!/^[a-z0-9]{1,15}$/.test(ext)) {
    return null;
  }
  return ext;
}

function resolveDocumentFileFormat(
  mimetype: string,
  originalname: string,
): string {
  const canonical = DOCUMENT_MIME_TO_EXT[mimetype];
  if (!canonical) {
    return '';
  }
  const fromName = parseFilenameExtension(originalname);
  if (fromName && fromName === canonical) {
    return fromName;
  }
  return canonical;
}

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly repository: Repository<Upload>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<Upload> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để tải lên');
    }

    if (!ALLOWED_DOCUMENT_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Định dạng file không được hỗ trợ. Vui lòng tải lên file PDF, DOCX, XLSX, EPUB hoặc MOBI',
      );
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Kích thước file không được vượt quá 50MB');
    }

    const result = await this.cloudinaryService.uploadDocument(file);

    const fileFormat = resolveDocumentFileFormat(
      file.mimetype,
      file.originalname,
    );

    const upload = this.repository.create({
      originalName: file.originalname,
      fileName: result.public_id.split('/').pop() || file.originalname,
      slug: result.public_id,
      filePath: result.secure_url,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileFormat: fileFormat,
    });

    return this.repository.save(upload);
  }

  async create(createDto: CreateUploadDto): Promise<Upload> {
    const item = this.repository.create(
      createDto as unknown as Partial<Upload>,
    );
    return this.repository.save(item);
  }

  async findAll(query: FilterUploadDto): Promise<PaginationDto<Upload>> {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repository.createQueryBuilder('entity');
    if (search && search.trim()) {
      qb.where(
        'entity.originalName ILIKE :search OR entity.fileName ILIKE :search OR entity.slug ILIKE :search',
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

  async findOne(id: string): Promise<Upload> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(id: string, updateDto: UpdateUploadDto): Promise<Upload> {
    const item = await this.findOne(id);
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<Upload>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }
}
