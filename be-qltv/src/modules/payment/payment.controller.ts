import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtGuard } from 'src/common/guards/jwt.guard';
import { JwtPayload } from 'src/common/types/jwt.type';

import { CreatePaymentDto } from './dto/create-payment.dto';
import type { PayosWebhookBodyPayload } from './dto/payos-webhook-body.payload';
import { PaymentWebhookGuard } from './guards/payment-webhook.guard';
import { PaymentService } from './payment.service';

@ApiTags('💳 Thanh toán (PayOS)')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async createPayment(
    @Body() body: CreatePaymentDto,
    @Req() req: { user: JwtPayload },
  ) {
    return this.paymentService.createPayment(body, {
      requesterUserId: req.user.sub,
    });
  }

  @Post('webhook')
  @UseGuards(PaymentWebhookGuard)
  handleWebhook(@Body() body: PayosWebhookBodyPayload) {
    return this.paymentService.handleWebhook(body);
  }
}
