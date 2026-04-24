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
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateBookAuthorDto } from './dto/create-book-author.dto';
import { FilterBookAuthorDto } from './dto/filter-book-author.dto';
import { UpdateBookAuthorDto } from './dto/update-book-author.dto';
import { BookAuthor } from './entities/book-author.entity';
import { BookAuthorsService } from './book-authors.service';

@ApiTags('✍️ Quản lý liên kết sách - tác giả')
@ApiBearerAuth()
@Controller('book-authors')
export class BookAuthorsController {
  constructor(private readonly service: BookAuthorsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo liên kết sách - tác giả' })
  @ApiBody({ type: CreateBookAuthorDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo liên kết sách - tác giả thành công.',
    type: BookAuthor,
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
    description: 'Sách hoặc tác giả không tồn tại.',
  })
  @ApiResponse({
    status: 409,
    description: 'Liên kết sách - tác giả đã tồn tại.',
  })
  create(@Body() dto: CreateBookAuthorDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách liên kết sách - tác giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách liên kết sách - tác giả thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterBookAuthorDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết liên kết sách - tác giả theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID liên kết (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết liên kết sách - tác giả thành công.',
    type: BookAuthor,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy liên kết sách - tác giả với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật liên kết sách - tác giả' })
  @ApiParam({
    name: 'id',
    description: 'ID liên kết (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateBookAuthorDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật liên kết sách - tác giả thành công.',
    type: BookAuthor,
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
    description: 'Không tìm thấy liên kết sách - tác giả với ID này.',
  })
  @ApiResponse({
    status: 409,
    description: 'Liên kết sách - tác giả đã tồn tại.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateBookAuthorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa liên kết sách - tác giả' })
  @ApiParam({
    name: 'id',
    description: 'ID liên kết (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa liên kết sách - tác giả thành công.',
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
    description: 'Không tìm thấy liên kết sách - tác giả với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
