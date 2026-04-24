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
import { CreateLocationDto } from './dto/create-location.dto';
import { FilterLocationDto } from './dto/filter-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { LocationsService } from './locations.service';

@ApiTags('📍 Quản lý vị trí')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo mới vị trí' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo vị trí thành công.',
    type: Location,
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
    description: 'Tên vị trí đã tồn tại trong hệ thống.',
  })
  create(@Body() dto: CreateLocationDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách vị trí' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách vị trí thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterLocationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết vị trí theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID vị trí (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết vị trí thành công.',
    type: Location,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy vị trí với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin vị trí' })
  @ApiParam({
    name: 'id',
    description: 'ID vị trí (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật vị trí thành công.',
    type: Location,
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
    description: 'Không tìm thấy vị trí với ID này.',
  })
  @ApiResponse({
    status: 409,
    description: 'Tên vị trí đã tồn tại trong hệ thống.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa vị trí' })
  @ApiParam({
    name: 'id',
    description: 'ID vị trí (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa vị trí thành công.' })
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
    description: 'Không tìm thấy vị trí với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
