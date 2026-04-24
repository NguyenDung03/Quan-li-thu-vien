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
import { CreateFineDto } from './dto/create-fine.dto';
import { FineRulesResponseDto, UpdateFineRulesDto } from './dto/fine-rules.dto';
import { FilterFineDto } from './dto/filter-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { Fine } from './entities/fine.entity';
import { FinesService } from './fines.service';

@ApiTags('💰 Quản lý phiếu phạt')
@ApiBearerAuth()
@Controller('fines')
export class FinesController {
  constructor(private readonly service: FinesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo phiếu phạt' })
  @ApiBody({ type: CreateFineDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo phiếu phạt thành công.',
    type: Fine,
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
    description: 'Phiếu mượn không tồn tại.',
  })
  @ApiResponse({
    status: 409,
    description: 'Phiếu phạt đã tồn tại cho phiếu mượn này.',
  })
  create(@Body() dto: CreateFineDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách phiếu phạt' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phiếu phạt thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterFineDto) {
    return this.service.findAll(query);
  }

  @Get('rules')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Lấy quy định tiền phạt (cấu hình hệ thống)' })
  @ApiResponse({
    status: 200,
    description: 'Thành công.',
    type: FineRulesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền. Yêu cầu vai trò Admin.',
  })
  getFineRules(): Promise<FineRulesResponseDto> {
    return this.service.getFineRules();
  }

  @Patch('rules')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({
    summary: 'Cập nhật quy định tiền phạt (VD: tiền/ngày quá hạn)',
  })
  @ApiBody({ type: UpdateFineRulesDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công.',
    type: FineRulesResponseDto,
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
  updateFineRules(
    @Body() dto: UpdateFineRulesDto,
  ): Promise<FineRulesResponseDto> {
    return this.service.updateFineRules(dto);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết phiếu phạt theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu phạt (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết phiếu phạt thành công.',
    type: Fine,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy phiếu phạt với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật phiếu phạt (thanh toán)' })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu phạt (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateFineDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật phiếu phạt thành công.',
    type: Fine,
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
    description: 'Không tìm thấy phiếu phạt với ID này.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateFineDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa phiếu phạt' })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu phạt (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa phiếu phạt thành công.' })
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
    description: 'Không tìm thấy phiếu phạt với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
