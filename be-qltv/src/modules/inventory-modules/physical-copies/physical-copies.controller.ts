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
import { CreatePhysicalCopyDto } from './dto/create-physical-copy.dto';
import { FilterPhysicalCopyDto } from './dto/filter-physical-copy.dto';
import { UpdatePhysicalCopyDto } from './dto/update-physical-copy.dto';
import { PhysicalCopy } from './entities/physical-copy.entity';
import { PhysicalCopiesService } from './physical-copies.service';

@ApiTags('📦 Quản lý bản sao vật lý')
@ApiBearerAuth()
@Controller('physical-copies')
export class PhysicalCopiesController {
  constructor(private readonly service: PhysicalCopiesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo mới bản sao vật lý' })
  @ApiBody({ type: CreatePhysicalCopyDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo bản sao vật lý thành công.',
    type: PhysicalCopy,
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
    description: 'Sách hoặc vị trí không tồn tại.',
  })
  @ApiResponse({
    status: 409,
    description: 'Mã bản sao đã tồn tại trong hệ thống.',
  })
  create(@Body() dto: CreatePhysicalCopyDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách bản sao vật lý' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bản sao vật lý thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterPhysicalCopyDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết bản sao vật lý theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID bản sao vật lý (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết bản sao vật lý thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản sao vật lý với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin bản sao vật lý' })
  @ApiParam({
    name: 'id',
    description: 'ID bản sao vật lý (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdatePhysicalCopyDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật bản sao vật lý thành công.',
    type: PhysicalCopy,
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
    description: 'Không tìm thấy bản sao vật lý với ID này.',
  })
  update(@Param('id') id: string, @Body() dto: UpdatePhysicalCopyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa bản sao vật lý' })
  @ApiParam({
    name: 'id',
    description: 'ID bản sao vật lý (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa bản sao vật lý thành công.' })
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
    description: 'Không tìm thấy bản sao vật lý với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
