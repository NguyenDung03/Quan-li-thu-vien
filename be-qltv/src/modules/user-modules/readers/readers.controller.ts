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
import { FilterReaderDto } from './dto/filter-reader.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateReaderDto } from './dto/create-reader.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';
import { Reader } from './entities/reader.entity';
import { ReadersService } from './readers.service';

@ApiTags('📖 Quản lý độc giả')
@ApiBearerAuth()
@Controller('readers')
export class ReadersController {
  constructor(private readonly readersService: ReadersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo mới độc giả' })
  @ApiBody({ type: CreateReaderDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo độc giả thành công.',
    type: Reader,
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
    description: 'Người dùng hoặc loại độc giả không tồn tại.',
  })
  @ApiResponse({
    status: 409,
    description: 'Độc giả đã tồn tại cho người dùng này.',
  })
  create(@Body() createReaderDto: CreateReaderDto) {
    return this.readersService.create(createReaderDto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách độc giả thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterReaderDto) {
    return this.readersService.findAll(query);
  }

  @Get('user/:userId')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy thông tin độc giả qua userId' })
  @ApiParam({
    name: 'userId',
    description: 'ID người dùng (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy độc giả với userId này.',
  })
  findByUserId(@Param('userId') userId: string) {
    return this.readersService.findByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết độc giả theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID độc giả (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy độc giả với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.readersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin độc giả' })
  @ApiParam({
    name: 'id',
    description: 'ID độc giả (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateReaderDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật độc giả thành công.',
    type: Reader,
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
    description: 'Không tìm thấy độc giả với ID này.',
  })
  update(@Param('id') id: string, @Body() updateReaderDto: UpdateReaderDto) {
    return this.readersService.update(id, updateReaderDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa độc giả' })
  @ApiParam({
    name: 'id',
    description: 'ID độc giả (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa độc giả thành công.' })
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
    description: 'Không tìm thấy độc giả với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.readersService.remove(id);
  }
}
