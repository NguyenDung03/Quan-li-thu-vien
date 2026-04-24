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
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { FilterGradeLevelDto } from './dto/filter-grade-level.dto';
import { UpdateGradeLevelDto } from './dto/update-grade-level.dto';
import { GradeLevel } from './entities/grade-level.entity';
import { GradeLevelsService } from './grade-levels.service';

@ApiTags('🎓 Quản lý khối lớp')
@ApiBearerAuth()
@Controller('grade-levels')
export class GradeLevelsController {
  constructor(private readonly service: GradeLevelsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo mới khối lớp' })
  @ApiBody({ type: CreateGradeLevelDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo khối lớp thành công.',
    type: GradeLevel,
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
    description: 'Tên khối lớp đã tồn tại trong hệ thống.',
  })
  create(@Body() dto: CreateGradeLevelDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách khối lớp' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách khối lớp thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterGradeLevelDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết khối lớp theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID khối lớp (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết khối lớp thành công.',
    type: GradeLevel,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy khối lớp với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin khối lớp' })
  @ApiParam({
    name: 'id',
    description: 'ID khối lớp (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateGradeLevelDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật khối lớp thành công.',
    type: GradeLevel,
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
    description: 'Không tìm thấy khối lớp với ID này.',
  })
  @ApiResponse({
    status: 409,
    description: 'Tên khối lớp đã tồn tại trong hệ thống.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateGradeLevelDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa khối lớp' })
  @ApiParam({
    name: 'id',
    description: 'ID khối lớp (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa khối lớp thành công.' })
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
    description: 'Không tìm thấy khối lớp với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
