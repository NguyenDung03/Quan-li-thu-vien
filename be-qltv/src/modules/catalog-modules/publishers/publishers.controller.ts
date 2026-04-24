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
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { FilterPublisherDto } from './dto/filter-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { Publisher } from './entities/publisher.entity';
import { PublishersService } from './publishers.service';

@ApiTags('🏢 Quản lý nhà xuất bản')
@ApiBearerAuth()
@Controller('publishers')
export class PublishersController {
  constructor(private readonly service: PublishersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo mới nhà xuất bản' })
  @ApiBody({ type: CreatePublisherDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhà xuất bản thành công.',
    type: Publisher,
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
    description: 'Tên nhà xuất bản đã tồn tại trong hệ thống.',
  })
  create(@Body() dto: CreatePublisherDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách nhà xuất bản' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nhà xuất bản thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterPublisherDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết nhà xuất bản theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID nhà xuất bản (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết nhà xuất bản thành công.',
    type: Publisher,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy nhà xuất bản với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin nhà xuất bản' })
  @ApiParam({
    name: 'id',
    description: 'ID nhà xuất bản (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdatePublisherDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật nhà xuất bản thành công.',
    type: Publisher,
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
    description: 'Không tìm thấy nhà xuất bản với ID này.',
  })
  @ApiResponse({
    status: 409,
    description: 'Tên nhà xuất bản đã tồn tại trong hệ thống.',
  })
  update(@Param('id') id: string, @Body() dto: UpdatePublisherDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa nhà xuất bản' })
  @ApiParam({
    name: 'id',
    description: 'ID nhà xuất bản (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa nhà xuất bản thành công.' })
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
    description: 'Không tìm thấy nhà xuất bản với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
