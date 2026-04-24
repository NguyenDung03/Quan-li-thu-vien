import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FilterUploadDto } from './dto/filter-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { Upload } from './entities/upload.entity';
import { UploadsService } from './uploads.service';

@ApiTags('📁 Quản lý tệp tải lên')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly service: UploadsService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Tải lên file tài liệu (PDF, DOCX, EPUB...)',
    description:
      'Upload file tài liệu lên Cloudinary. Hỗ trợ PDF, DOCX, XLSX, EPUB, MOBI. Kích thước tối đa 50MB.',
  })
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({
    status: 201,
    description: 'Tải file lên thành công.',
    type: Upload,
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc kích thước vượt quá 50MB.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền. Yêu cầu vai trò Admin.',
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadFile(file);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách tệp tải lên' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách tệp tải lên thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterUploadDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết tệp tải lên theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID tệp tải lên (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết tệp tải lên thành công.',
    type: Upload,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tệp tải lên với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin tệp tải lên' })
  @ApiParam({
    name: 'id',
    description: 'ID tệp tải lên (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateUploadDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật tệp tải lên thành công.',
    type: Upload,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền. Yêu cầu vai trò Admin.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tệp tải lên với ID này.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateUploadDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa tệp tải lên' })
  @ApiParam({
    name: 'id',
    description: 'ID tệp tải lên (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa tệp tải lên thành công.' })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền. Yêu cầu vai trò Admin.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tệp tải lên với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
