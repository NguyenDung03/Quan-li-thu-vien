import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Sse,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
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
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { ReservationsService } from './reservations.service';
import { ReservationNotificationService } from './reservation-notification.service';
import { JwtPayload } from 'src/common/types/jwt.type';

type JwtPayloadWithPurpose = JwtPayload & { purpose?: string };

@ApiTags('📌 Quản lý đặt trước sách')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly service: ReservationsService,
    private readonly notificationService: ReservationNotificationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Tạo đặt trước sách' })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo đặt trước sách thành công.',
    type: Reservation,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Độc giả hoặc sách không tồn tại.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Độc giả có phiếu phạt chưa thanh toán, số sách mượn đã đạt giới hạn, hoặc bản sao vật lý không khả dụng.',
  })
  @ApiResponse({
    status: 403,
    description: 'Tài khoản không có hồ sơ độc giả.',
  })
  @ApiResponse({
    status: 400,
    description: 'Admin tạo đặt trước thiếu readerId.',
  })
  async create(
    @Body() dto: CreateReservationDto,
    @Req() req: { user: JwtPayload },
  ) {
    const isAdmin = await this.service.isAdminUser(req.user.sub);
    const readerId =
      isAdmin && dto.readerId
        ? dto.readerId
        : await this.service.resolveReaderIdForUser(req.user.sub);
    if (isAdmin && !dto.readerId) {
      throw new BadRequestException('Admin tạo đặt trước cần gửi readerId');
    }
    return this.service.create(readerId, dto.bookId);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy danh sách đặt trước sách của reader hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách đặt trước sách thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Tài khoản không có hồ sơ độc giả.',
  })
  async findAllByReader(
    @Query() query: FilterReservationDto,
    @Req() req: { user: JwtPayload },
  ) {
    const readerId = await this.service.resolveReaderIdForUser(req.user.sub);
    return this.service.findAllByReader(readerId, query);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Lấy danh sách đặt trước sách (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách đặt trước sách thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterReservationDto) {
    return this.service.findAll(query);
  }

  @Post('notifications/admin/sse-ticket')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Cấp ticket JWT ngắn hạn chỉ cho SSE admin (tránh đưa access_token lên query string)',
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket dùng cho query `ticket` trên URL stream.',
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không phải admin.' })
  async mintAdminSseTicket(@Req() req: { user: JwtPayload }) {
    const ttl = this.configService.get<string>(
      'SSE_ADMIN_TICKET_EXPIRES_IN',
      '8h',
    );
    const ticket = await this.jwtService.signAsync(
      { sub: req.user.sub, purpose: 'sse_admin' },
      { expiresIn: ttl as JwtSignOptions['expiresIn'] },
    );
    return { ticket };
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết đặt trước sách theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID đặt trước (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết đặt trước sách thành công.',
    type: Reservation,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đặt trước sách với ID này.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xem đặt trước này.',
  })
  async findOne(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    return await this.service.findOneVisibleToUser(id, req.user.sub);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật đặt trước sách (hủy / xác nhận)' })
  @ApiParam({
    name: 'id',
    description: 'ID đặt trước (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateReservationDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật đặt trước sách thành công.',
    type: Reservation,
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
    description: 'Không tìm thấy đặt trước sách với ID này.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa đặt trước sách' })
  @ApiParam({
    name: 'id',
    description: 'ID đặt trước (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa đặt trước sách thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa đặt trước đã được duyệt (fulfilled).',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đặt trước sách với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Sse('notifications/admin/stream')
  @ApiOperation({
    summary:
      'SSE stream thông báo reservation cho admin (query `ticket` từ POST sse-ticket; `token` = access_token vẫn hỗ trợ tương thích cũ)',
  })
  async streamReservationNotificationsForAdmin(
    @Query('ticket') ticket?: string,
    @Query('token') legacyAccessToken?: string,
  ) {
    const raw = ticket ?? legacyAccessToken;
    if (!raw) {
      throw new BadRequestException(
        'Thiếu ticket (khuyên dùng) hoặc token để kết nối thông báo',
      );
    }

    let payload: JwtPayloadWithPurpose;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayloadWithPurpose>(raw);
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    if (payload.purpose !== undefined && payload.purpose !== 'sse_admin') {
      throw new UnauthorizedException('Token không hợp lệ cho kênh SSE admin');
    }

    const isAdmin = await this.service.isAdminUser(payload.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Tài khoản không có quyền admin');
    }

    return this.notificationService.subscribeAdmin();
  }
}
