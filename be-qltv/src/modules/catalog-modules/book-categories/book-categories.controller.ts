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
import { CreateBookCategoryDto } from './dto/create-book-category.dto';
import { FilterBookCategoryDto } from './dto/filter-book-category.dto';
import { UpdateBookCategoryDto } from './dto/update-book-category.dto';
import { BookCategory } from './entities/book-category.entity';
import { BookCategoriesService } from './book-categories.service';

@ApiTags('🏷️ Quản lý thể loại sách')
@ApiBearerAuth()
@Controller('book-categories')
export class BookCategoriesController {
  constructor(private readonly service: BookCategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo mới thể loại sách' })
  @ApiBody({ type: CreateBookCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo thể loại sách thành công.',
    type: BookCategory,
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
    status: 409,
    description: 'Tên thể loại sách đã tồn tại trong hệ thống.',
  })
  create(@Body() dto: CreateBookCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách thể loại sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thể loại sách thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterBookCategoryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết thể loại sách theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID thể loại sách (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết thể loại sách thành công.',
    type: BookCategory,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thể loại sách với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin thể loại sách' })
  @ApiParam({
    name: 'id',
    description: 'ID thể loại sách (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateBookCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thể loại sách thành công.',
    type: BookCategory,
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
    description: 'Không tìm thấy thể loại sách với ID này.',
  })
  @ApiResponse({
    status: 409,
    description: 'Tên thể loại sách đã tồn tại trong hệ thống.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateBookCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa thể loại sách' })
  @ApiParam({
    name: 'id',
    description: 'ID thể loại sách (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa thể loại sách thành công.' })
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
    description: 'Không tìm thấy thể loại sách với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
