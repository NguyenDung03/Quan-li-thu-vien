import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CrawlUrlDto, CrawlResponseDto } from './dto/crawl.dto';
import { CrawlService } from './crawl.service';

@ApiTags('🕷️ Crawl dữ liệu')
@ApiBearerAuth()
@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({
    summary: '📥 Crawl dữ liệu từ website thư viện',
    description:
      'Gửi tác vụ crawl đến Crawl4AI service. Trả về kết quả Markdown nếu tác vụ nhanh, hoặc task_id nếu cần chờ.',
  })
  @ApiBody({
    description: 'Thông tin URL và độ ưu tiên cần crawl',
    type: CrawlUrlDto,
    examples: {
      singleUrl: {
        summary: 'Crawl một trang',
        value: {
          urls: [
            'raw:<html><body><h1>Nội quy thư viện</h1><p><strong>1. Quy định mượn sách</strong></p><p>- Mỗi người được mượn tối đa 3 quyển.</p><p>- Thời hạn mượn là 7 ngày.</p><p>- Có thể gia hạn nếu chưa có người đặt trước.</p><p><strong>2. Quy định trả sách</strong></p><p>- Trả sách đúng hạn, quá hạn sẽ bị xử lý theo quy định.</p><p>- Sách phải được trả nguyên vẹn, không rách, không bẩn.</p><p><strong>3. Bảo quản tài liệu</strong></p><p>- Không viết, vẽ, gấp mép hoặc làm hỏng sách.</p><p>- Làm mất hoặc hư hỏng phải bồi thường.</p><p><strong>4. Quy định trong thư viện</strong></p><p>- Giữ trật tự, không gây ồn ào.</p><p>- Không ăn uống trong khu vực đọc sách.</p><p>- Giữ vệ sinh chung.</p><p><strong>5. Sử dụng thiết bị</strong></p><p>- Máy tính và wifi chỉ phục vụ học tập.</p><p>- Không truy cập nội dung không phù hợp.</p><p><strong>6. Xử lý vi phạm</strong></p><p>- Vi phạm sẽ bị nhắc nhở hoặc đình chỉ quyền sử dụng thư viện.</p></body></html>',
          ],
          priority: 10,
        },
      },
      multipleUrls: {
        summary: 'Crawl nhiều trang',
        value: {
          urls: [
            'https://thuvien.example.com/noi-quy',
            'https://thuvien.example.com/lien-he',
          ],
          priority: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '✅ Crawl thành công - Trả về kết quả hoặc task_id',
    type: CrawlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      '❌ Dữ liệu đầu vào không hợp lệ (urls rỗng hoặc không đúng định dạng)',
  })
  @ApiUnauthorizedResponse({
    description: '❌ Chưa xác thực - Token không hợp lệ hoặc hết hạn',
  })
  @ApiForbiddenResponse({
    description: '❌ Không có quyền - Yêu cầu vai trò Admin',
  })
  @ApiResponse({
    status: 503,
    description:
      '❌ Không thể kết nối đến Crawl4AI service hoặc service trả lỗi',
  })
  crawl(@Body() dto: CrawlUrlDto) {
    return this.crawlService.crawl(dto);
  }

  @Get('health')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: '💓 Kiểm tra trạng thái Crawl4AI service',
    description:
      'Kiểm tra xem Crawl4AI Docker container có đang chạy và sẵn sàng không',
  })
  @ApiResponse({
    status: 200,
    description:
      '✅ Trả về trạng thái kết nối: connected/unhealthy/unreachable',
    schema: {
      example: {
        status: 'connected',
        service: 'Crawl4AI',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '❌ Chưa xác thực - Token không hợp lệ hoặc hết hạn',
  })
  checkHealth() {
    return this.crawlService.checkHealth();
  }

  @Get('task/:taskId')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiOperation({
    summary: '📄 Lấy kết quả crawl theo task ID',
    description:
      'Tra cứu kết quả của một tác vụ crawl đang chờ xử lý. Dùng khi /crawl trả về task_id.',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID của tác vụ crawl (trả về từ API /crawl)',
    example: 'task_abc123xyz',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Trả về kết quả crawl (Markdown, HTML, v.v.)',
  })
  @ApiUnauthorizedResponse({
    description: '❌ Chưa xác thực - Token không hợp lệ hoặc hết hạn',
  })
  @ApiForbiddenResponse({
    description: '❌ Không có quyền - Yêu cầu vai trò Admin',
  })
  @ApiResponse({
    status: 503,
    description: '❌ Không thể kết nối đến Crawl4AI service',
  })
  getTaskResult(@Param('taskId') taskId: string) {
    return this.crawlService.getTaskResult(taskId);
  }
}
