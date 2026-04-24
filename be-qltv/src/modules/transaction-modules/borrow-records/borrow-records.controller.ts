import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Sse,
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
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { FilterBorrowRecordDto } from './dto/filter-borrow-record.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { MarkLostBookDto } from './dto/mark-lost-book.dto';
import { BorrowRecord } from './entities/borrow-record.entity';
import { BorrowRecordsService } from './borrow-records.service';
import { BorrowRecordNotificationService } from './borrow-record-notification.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/types/jwt.type';
import { PaymentService } from 'src/modules/payment/payment.service';
import { RenewBorrowPayOsDto } from './dto/renew-borrow-pay-os.dto';
import { RenewOfflineDto } from './dto/renew-offline.dto';

@ApiTags('📋 Quản lý phiếu mượn sách')
@ApiBearerAuth()
@Controller('borrow-records')
export class BorrowRecordsController {
  constructor(
    private readonly service: BorrowRecordsService,
    private readonly notificationService: BorrowRecordNotificationService,
    private readonly jwtService: JwtService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo phiếu mượn sách' })
  @ApiBody({ type: CreateBorrowRecordDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo phiếu mượn sách thành công.',
    type: BorrowRecord,
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
    description: 'Độc giả, bản sao vật lý hoặc bản ghi không tồn tại.',
  })
  @ApiResponse({
    status: 409,
    description: 'Bản sao vật lý đang được mượn hoặc không khả dụng.',
  })
  create(@Body() dto: CreateBorrowRecordDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Lấy danh sách phiếu mượn sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phiếu mượn sách thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findAll(@Query() query: FilterBorrowRecordDto) {
    return this.service.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Lấy danh sách phiếu mượn của độc giả (theo readerId)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phiếu mượn thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  findMyRecords(@Query() query: FilterBorrowRecordDto) {
    const { readerId, ...rest } = query;
    if (!readerId) {
      return {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
    return this.service.findAllByReader(
      readerId,
      rest as FilterBorrowRecordDto,
    );
  }

  @Post('system/run-overdue-check')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({
    summary: '[Admin] Chạy tay job quá hạn / tự động mất',
    description:
      'Gọi ngay `checkAndUpdateOverdueRecords` (cùng logic cron nửa đêm). Dùng để kiểm thử.',
  })
  @ApiResponse({
    status: 200,
    description: 'Đã chạy xong (không có lỗi hệ thống).',
  })
  @ApiResponse({ status: 403, description: 'Không phải Admin.' })
  runOverdueCheckNow() {
    return this.service.runOverdueCheckNow();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Lấy chi tiết phiếu mượn sách theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu mượn (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết phiếu mượn sách thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy phiếu mượn sách với ID này.',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Cập nhật phiếu mượn sách' })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu mượn (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateBorrowRecordDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật phiếu mượn sách thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy phiếu mượn sách với ID này.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateBorrowRecordDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/return')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Trả sách' })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu mượn (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: ReturnBookDto })
  @ApiResponse({
    status: 200,
    description: 'Trả sách thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy phiếu mượn sách với ID này.',
  })
  returnBook(@Param('id') id: string, @Body() dto: ReturnBookDto) {
    return this.service.returnBook(id, dto);
  }

  @Post(':id/mark-lost')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Đánh dấu mất sách' })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu mượn (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: MarkLostBookDto })
  @ApiResponse({
    status: 200,
    description: 'Đã cập nhật trạng thái mất sách và tạo phiếu phạt.',
    type: BorrowRecord,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy phiếu mượn sách với ID này.',
  })
  markBookAsLost(@Param('id') id: string, @Body() dto: MarkLostBookDto) {
    return this.service.markBookAsLost(id, dto);
  }

  @Post(':id/renew/offline')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBody({ type: RenewOfflineDto, required: false })
  @ApiOperation({
    summary: 'Gia hạn tại quầy (tiền mặt, không PayOS)',
    description:
      'Admin: ghi nhận thu tiền vào bảng fines (PAID + CASH + collected_by), rồi cộng dueDate. ' +
      'fineAmount mặc định = renewalFeeAmount (cài đặt phạt); collectedBy mặc định = admin đang đăng nhập.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu mượn (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Gia hạn thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({ status: 403, description: 'Không đủ quyền.' })
  renewBookOffline(
    @Param('id') id: string,
    @Body() body: RenewOfflineDto,
    @Req() req: { user: JwtPayload },
  ) {
    return this.service.renewBookAtCounter(id, req.user.sub, body ?? {});
  }

  @Post(':id/renew')
  @UseGuards(JwtGuard)
  @ApiBody({ type: RenewBorrowPayOsDto, required: false })
  @ApiOperation({
    summary: 'Gia hạn qua PayOS (phí gia hạn)',
    description:
      'Độc giả chủ phiếu hoặc admin: tạo fine phí gia hạn (nếu chưa có), reserve orderCode, trả link PayOS. Sau webhook PAID + cộng dueDate. Gia hạn tiền mặt tại quầy: POST .../renew/offline. Phạt thường: POST /payments + fineId.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu mượn (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description:
      'Tạo / tái sử dụng link thanh toán PayOS (cùng dạng response PayOS payment-requests).',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực. Token không hợp lệ hoặc hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không phải chủ phiếu và không phải admin.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy phiếu mượn sách với ID này.',
  })
  renewBorrowViaPayOs(
    @Param('id') id: string,
    @Body() body: RenewBorrowPayOsDto,
    @Req() req: { user: JwtPayload },
  ) {
    return this.paymentService.createRenewalPaymentForBorrow(
      id,
      body ?? {},
      req.user.sub,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Xóa phiếu mượn sách' })
  @ApiParam({
    name: 'id',
    description: 'ID phiếu mượn (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Xóa phiếu mượn sách thành công.' })
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
    description: 'Không tìm thấy phiếu mượn sách với ID này.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Sse('notifications/stream')
  @ApiOperation({
    summary: 'SSE stream thông báo phiếu mượn cho customer',
  })
  async streamBorrowNotifications(@Query('token') token?: string) {
    if (!token) {
      throw new BadRequestException('Thiếu token để kết nối thông báo');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const reader = await this.service.findReaderByUserId(payload.sub);
      if (!reader) {
        throw new BadRequestException('Không tìm thấy độc giả');
      }
      return this.notificationService.subscribe(reader.id);
    } catch {
      throw new BadRequestException('Token không hợp lệ');
    }
  }
}
