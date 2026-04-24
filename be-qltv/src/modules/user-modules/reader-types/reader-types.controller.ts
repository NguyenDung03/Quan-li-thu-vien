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
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateReaderTypeDto } from './dto/create-reader-type.dto';
import { UpdateReaderTypeDto } from './dto/update-reader-type.dto';
import { ReaderType } from './entities/reader-type.entity';
import { ReaderTypesService } from './reader-types.service';

@ApiTags('👥 Quản lý loại độc giả')
@ApiBearerAuth()
@Controller('reader-types')
export class ReaderTypesController {
  constructor(private readonly readerTypesService: ReaderTypesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo mới loại độc giả' })
  @ApiBody({ type: CreateReaderTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo loại độc giả thành công.',
    type: ReaderType,
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
    description: 'Tên loại độc giả đã tồn tại trong hệ thống.',
  })
  create(@Body() createReaderTypeDto: CreateReaderTypeDto) {
    return this.readerTypesService.create(createReaderTypeDto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách loại độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách loại độc giả thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: PaginationQueryDto) {
    return this.readerTypesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết loại độc giả theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID loại độc giả (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết loại độc giả thành công.',
    type: ReaderType,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy loại độc giả với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.readerTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin loại độc giả' })
  @ApiParam({
    name: 'id',
    description: 'ID loại độc giả (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateReaderTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật loại độc giả thành công.',
    type: ReaderType,
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
    description: 'Không tìm thấy loại độc giả với ID này.',
  })
  @ApiResponse({
    status: 409,
    description: 'Tên loại độc giả đã tồn tại trong hệ thống.',
  })
  update(
    @Param('id') id: string,
    @Body() updateReaderTypeDto: UpdateReaderTypeDto,
  ) {
    return this.readerTypesService.update(id, updateReaderTypeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa loại độc giả' })
  @ApiParam({
    name: 'id',
    description: 'ID loại độc giả (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa loại độc giả thành công.' })
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
    description: 'Không tìm thấy loại độc giả với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.readerTypesService.remove(id);
  }
}
