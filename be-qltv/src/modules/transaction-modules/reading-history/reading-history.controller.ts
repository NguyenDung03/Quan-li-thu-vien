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
import { CreateReadingHistoryDto } from './dto/create-reading-history.dto';
import { FilterReadingHistoryDto } from './dto/filter-reading-history.dto';
import { UpdateReadingHistoryDto } from './dto/update-reading-history.dto';
import { ReadingHistory } from './entities/reading-history.entity';
import { ReadingHistoryService } from './reading-history.service';

@ApiTags('📜 Quản lý lịch sử đọc sách')
@ApiBearerAuth()
@Controller('reading-history')
export class ReadingHistoryController {
  constructor(private readonly service: ReadingHistoryService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo lịch sử đọc sách' })
  @ApiBody({ type: CreateReadingHistoryDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo lịch sử đọc sách thành công.',
    type: ReadingHistory,
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
    description: 'Người dùng, sách điện tử hoặc bản ghi không tồn tại.',
  })
  @ApiResponse({
    status: 409,
    description: 'Lịch sử đọc đã tồn tại cho sách này.',
  })
  create(@Body() dto: CreateReadingHistoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách lịch sử đọc sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách lịch sử đọc sách thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterReadingHistoryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết lịch sử đọc sách theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID lịch sử đọc (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết lịch sử đọc sách thành công.',
    type: ReadingHistory,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lịch sử đọc sách với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật lịch sử đọc sách' })
  @ApiParam({
    name: 'id',
    description: 'ID lịch sử đọc (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateReadingHistoryDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật lịch sử đọc sách thành công.',
    type: ReadingHistory,
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
    description: 'Không tìm thấy lịch sử đọc sách với ID này.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateReadingHistoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa lịch sử đọc sách' })
  @ApiParam({
    name: 'id',
    description: 'ID lịch sử đọc (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa lịch sử đọc sách thành công.' })
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
    description: 'Không tìm thấy lịch sử đọc sách với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
