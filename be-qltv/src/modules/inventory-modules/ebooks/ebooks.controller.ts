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
import { CreateEbookDto } from './dto/create-ebook.dto';
import { FilterEbookDto } from './dto/filter-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import { Ebook } from './entities/ebook.entity';
import { EbooksService } from './ebooks.service';

@ApiTags('📱 Quản lý sách điện tử (Ebook)')
@ApiBearerAuth()
@Controller('ebooks')
export class EbooksController {
  constructor(private readonly service: EbooksService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo mới sách điện tử' })
  @ApiBody({ type: CreateEbookDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo sách điện tử thành công.',
    type: Ebook,
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
    description: 'Sách không tồn tại trong hệ thống.',
  })
  @ApiResponse({
    status: 409,
    description: 'Sách điện tử đã tồn tại cho sách này.',
  })
  create(@Body() dto: CreateEbookDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách sách điện tử' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sách điện tử thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterEbookDto) {
    return this.service.findAll(query);
  }

  @Get('by-book/:bookId')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy sách điện tử theo Book ID' })
  @ApiParam({
    name: 'bookId',
    description: 'ID sách (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sách điện tử thành công.',
    type: Ebook,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sách điện tử cho sách này.',
  })
  findByBookId(@Param('bookId') bookId: string) {
    return this.service.findByBookId(bookId);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết sách điện tử theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID sách điện tử (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết sách điện tử thành công.',
    type: Ebook,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sách điện tử với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/download')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Tăng lượt tải sách điện tử' })
  @ApiParam({
    name: 'id',
    description: 'ID sách điện tử (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật lượt tải thành công.',
    type: Ebook,
  })
  incrementDownload(@Param('id') id: string) {
    return this.service.incrementDownloadCount(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin sách điện tử' })
  @ApiParam({
    name: 'id',
    description: 'ID sách điện tử (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateEbookDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật sách điện tử thành công.',
    type: Ebook,
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
    description: 'Không tìm thấy sách điện tử với ID này.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateEbookDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa sách điện tử' })
  @ApiParam({
    name: 'id',
    description: 'ID sách điện tử (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa sách điện tử thành công.' })
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
    description: 'Không tìm thấy sách điện tử với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
