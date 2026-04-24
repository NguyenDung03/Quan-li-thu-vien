import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryQueryDto } from './dto/dashboard-summary-query.dto';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary-response.dto';

@ApiTags('📊 Bảng điều khiển (Admin)')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard-summary')
  @ApiOperation({
    summary: 'Tóm tắt dashboard (chuỗi đã group sẵn cho Recharts)',
    description:
      'Trả KPI, phân bổ theo trạng thái (mượn / sách / phạt / đặt trước) và activityByDay theo ngày UTC. Query `days` (1–366, mặc định 30) quy định độ dài chuỗi thời gian.',
  })
  @ApiResponse({ status: 200, type: DashboardSummaryResponseDto })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không phải admin' })
  getDashboardSummary(
    @Query() query: DashboardSummaryQueryDto,
  ): Promise<DashboardSummaryResponseDto> {
    return this.dashboardService.getSummary(query.days);
  }
}
