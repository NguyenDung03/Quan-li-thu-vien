import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination-query.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/common/types/jwt.type';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { ImportResultDto } from './dto/import-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('👤 Quản lý người dùng')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo người dùng mới',
    description:
      'Tạo một tài khoản người dùng mới trong hệ thống. **Chỉ Admin mới có quyền thực hiện.**',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo người dùng thành công.',
    type: User,
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
    description: 'Tên đăng nhập hoặc email đã tồn tại.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({
    summary: 'Lấy danh sách người dùng',
    description:
      'Trả về danh sách người dùng có hỗ trợ phân trang, lọc theo vai trò, trạng thái và tìm kiếm. **Chỉ Admin mới có quyền thực hiện.**',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số bản ghi mỗi trang (mặc định: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Tìm kiếm theo tên đăng nhập hoặc email',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: UserRole,
    description: 'Lọc theo vai trò người dùng',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    type: Boolean,
    description: 'Lọc theo trạng thái hoạt động',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách người dùng thành công.',
    schema: {
      example: {
        data: [
          {
            id: 'uuid-1',
            username: 'john_doe',
            email: 'john@example.com',
            role: 'reader',
            accountStatus: 'active',
            lastLogin: '2026-01-01T00:00:00Z',
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền. Yêu cầu vai trò Admin.',
  })
  findAll(@Query() query: FilterUserDto): Promise<PaginationDto<User>> {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Lấy thông tin cá nhân',
    description:
      'Trả về thông tin của người dùng đang đăng nhập dựa trên JWT token. Mật khẩu không được trả về.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin cá nhân thành công.',
    schema: {
      example: {
        id: 'uuid-1',
        username: 'john_doe',
        email: 'john@example.com',
        role: 'reader',
        accountStatus: 'active',
        lastLogin: '2026-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  getMe(@Req() req: Request & { user: JwtPayload }) {
    return this.usersService.findOne(req.user.sub);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({
    summary: 'Lấy người dùng theo ID',
    description:
      'Trả về thông tin chi tiết của một người dùng theo ID. Mật khẩu không được trả về. **Chỉ Admin mới có quyền thực hiện.**',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID người dùng (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin người dùng thành công.',
    type: User,
  })
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
    description: 'Không tìm thấy người dùng với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({
    summary: 'Cập nhật thông tin người dùng',
    description:
      'Cập nhật một hoặc nhiều trường thông tin của người dùng theo ID. Tất cả các trường đều là tùy chọn. **Chỉ Admin mới có quyền thực hiện.**',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID người dùng (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật người dùng thành công.',
    type: User,
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
    description: 'Không tìm thấy người dùng với ID này.',
  })
  @ApiResponse({
    status: 409,
    description: 'Tên đăng nhập hoặc email đã tồn tại.',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xoá người dùng',
    description:
      'Xoá vĩnh viễn người dùng khỏi hệ thống theo ID. **Chỉ Admin mới có quyền thực hiện. Hành động này không thể hoàn tác.**',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID người dùng (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xoá người dùng thành công.' })
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
    description: 'Không tìm thấy người dùng với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import người dùng từ file Excel',
    description:
      'Upload file Excel (.xlsx) để import danh sách người dùng. **Chỉ Admin mới có quyền thực hiện.**',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel (.xlsx)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Import thành công',
    type: ImportResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc định dạng sai.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền. Yêu cầu vai trò Admin.',
  })
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    const result = await this.usersService.importFromExcel(file);

    if (result.successCount === 0 && result.totalCount > 0) {
      throw new BadRequestException({
        message: 'Lỗi xử lý: Dữ liệu không hợp lệ',
        details: result.skippedRecords,
      });
    }

    return result;
  }
}
