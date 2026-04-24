import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FilterBookGradeLevelDto } from './dto/filter-book-grade-level.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { BookGradeLevelsService } from './book-grade-levels.service';
import { CreateBookGradeLevelDto } from './dto/create-book-grade-level.dto';
import { UpdateBookGradeLevelDto } from './dto/update-book-grade-level.dto';
import { BookGradeLevel } from './entities/book-grade-level.entity';

@ApiTags('🎓 Quản lý liên kết sách - khối lớp')
@ApiBearerAuth()
@Controller('book-grade-levels')
export class BookGradeLevelsController {
  constructor(private readonly service: BookGradeLevelsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo liên kết sách - khối lớp' })
  @ApiBody({ type: CreateBookGradeLevelDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo liên kết sách - khối lớp thành công.',
    type: BookGradeLevel,
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
    description: 'Sách hoặc khối lớp không tồn tại.',
  })
  @ApiResponse({
    status: 409,
    description: 'Liên kết sách - khối lớp đã tồn tại.',
  })
  create(@Body() dto: CreateBookGradeLevelDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách liên kết sách - khối lớp' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách liên kết sách - khối lớp thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterBookGradeLevelDto) {
    return this.service.findAll(query);
  }

  @Get(':bookId/:gradeLevelId')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết liên kết sách - khối lớp' })
  @ApiParam({
    name: 'bookId',
    description: 'ID sách (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'gradeLevelId',
    description: 'ID khối lớp (UUID)',
    example: 'b1c2d3e4-f5a6-7890-bcde-f12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết liên kết sách - khối lớp thành công.',
    type: BookGradeLevel,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy liên kết sách - khối lớp với ID này.',
  })
  findOne(
    @Param('bookId') bookId: string,
    @Param('gradeLevelId') gradeLevelId: string,
  ) {
    return this.service.findOne(bookId, gradeLevelId);
  }

  @Patch(':bookId/:gradeLevelId')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật liên kết sách - khối lớp' })
  @ApiParam({
    name: 'bookId',
    description: 'ID sách (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'gradeLevelId',
    description: 'ID khối lớp (UUID)',
    example: 'b1c2d3e4-f5a6-7890-bcde-f12345678901',
  })
  @ApiBody({ type: UpdateBookGradeLevelDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật liên kết sách - khối lớp thành công.',
    type: BookGradeLevel,
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
    description: 'Không tìm thấy liên kết sách - khối lớp với ID này.',
  })
  update(
    @Param('bookId') bookId: string,
    @Param('gradeLevelId') gradeLevelId: string,
    @Body() dto: UpdateBookGradeLevelDto,
  ) {
    return this.service.update(bookId, gradeLevelId, dto);
  }

  @Delete(':bookId/:gradeLevelId')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa liên kết sách - khối lớp' })
  @ApiParam({
    name: 'bookId',
    description: 'ID sách (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'gradeLevelId',
    description: 'ID khối lớp (UUID)',
    example: 'b1c2d3e4-f5a6-7890-bcde-f12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa liên kết sách - khối lớp thành công.',
  })
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
    description: 'Không tìm thấy liên kết sách - khối lớp với ID này.',
  })
  remove(
    @Param('bookId') bookId: string,
    @Param('gradeLevelId') gradeLevelId: string,
  ) {
    return this.service.remove(bookId, gradeLevelId);
  }
}
