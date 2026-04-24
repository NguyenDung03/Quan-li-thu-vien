import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import { isRenewalFeeFineReason } from 'src/common/utils/fine-renewal-fee.util';
import { FinesService } from 'src/modules/transaction-modules/fines/fines.service';
import { BorrowRecordsService } from 'src/modules/transaction-modules/borrow-records/borrow-records.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { RenewBorrowPayOsDto } from 'src/modules/transaction-modules/borrow-records/dto/renew-borrow-pay-os.dto';
import { PayosPaymentCreatedResponse } from './dto/payos-payment-created.response';
import { PayosRequestPaymentPayload } from './dto/payos-request-payment.payload';
import { PayosWebhookBodyPayload } from './dto/payos-webhook-body.payload';
import { createPayOsPaymentRequestSignature } from './payos-utils';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly finesService: FinesService,
    private readonly borrowRecordsService: BorrowRecordsService,
  ) {}

  private buildCachedPayOsResponse(fine: {
    fineAmount: number | string;
    reason?: string;
    paymentCode: number | null;
    payosCheckoutUrl: string | null;
  }): PayosPaymentCreatedResponse {
    const orderCode = fine.paymentCode ?? 0;
    const hardcodedDescription = `Thanh toan don`.substring(0, 25);
    return {
      code: '00',
      desc: 'success',
      data: {
        bin: '',
        accountNumber: '',
        accountName: '',
        currency: 'VND',
        paymentLinkId: '',
        amount: Number(fine.fineAmount),
        description: hardcodedDescription,
        orderCode,
        expiredAt: 0,
        status: 'PENDING',
        checkoutUrl: fine.payosCheckoutUrl ?? '',
        qrCode: '',
      },
      signature: '',
    };
  }

  async createRenewalPaymentForBorrow(
    borrowId: string,
    body: RenewBorrowPayOsDto,
    requesterUserId: string,
  ): Promise<PayosPaymentCreatedResponse> {
    const { fineId } =
      await this.borrowRecordsService.createRenewalFeeFineForPayOs(
        borrowId,
        requesterUserId,
      );
    return this.createPayment(
      {
        fineId,
        returnUrl: body.returnUrl,
        cancelUrl: body.cancelUrl,
      },
      { allowRenewalFee: true, requesterUserId },
    );
  }

  async createPayment(
    body: CreatePaymentDto,
    options?: { allowRenewalFee?: boolean; requesterUserId?: string },
  ): Promise<PayosPaymentCreatedResponse> {
    const head = await this.finesService.findFineReasonById(body.fineId);
    if (!options?.allowRenewalFee && isRenewalFeeFineReason(head.reason)) {
      throw new BadRequestException(
        'Phí gia hạn: dùng POST /api/borrow-records/:id/renew (không dùng POST /payments với fineId phí gia hạn)',
      );
    }

    if (options?.requesterUserId) {
      await this.finesService.assertFinePayableByBorrowerUser(
        body.fineId,
        options.requesterUserId,
      );
    }

    const { fine, orderCode, hasStoredCheckout } =
      await this.finesService.reservePayOsPaymentSession(body.fineId);

    const returnUrl =
      body.returnUrl ??
      this.configService.getOrThrow<string>('PAYOS_RETURN_URL');
    const cancelUrl =
      body.cancelUrl ??
      this.configService.getOrThrow<string>('PAYOS_CANCEL_URL');

    if (body.amount != null) {
      const expected = Number(fine.fineAmount);
      if (Math.abs(expected - body.amount) > 0.5) {
        throw new BadRequestException('Số tiền không khớp với khoản phạt');
      }
    }

    if (hasStoredCheckout && fine.payosCheckoutUrl) {
      return this.buildCachedPayOsResponse(fine);
    }

    const amount = body.amount ?? Number(fine.fineAmount);

    const hardcodedDescription = `Thanh toan don ${orderCode}`.substring(0, 25);

    const url = `https://api-merchant.payos.vn/v2/payment-requests`;
    const config = {
      headers: {
        'x-client-id': this.configService.getOrThrow<string>('PAYOS_CLIENT_ID'),
        'x-api-key': this.configService.getOrThrow<string>('PAYOS_API_KEY'),
      },
    };
    const checksumKey =
      this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY');
    const signature = createPayOsPaymentRequestSignature(
      {
        amount,
        cancelUrl,
        description: hardcodedDescription,
        orderCode,
        returnUrl,
      },
      checksumKey,
    );
    const payload: PayosRequestPaymentPayload = {
      orderCode,
      amount,
      description: hardcodedDescription,
      cancelUrl,
      returnUrl,
      signature,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<PayosPaymentCreatedResponse>(
          url,
          payload,
          config,
        ),
      );
      const payos = response.data;
      if (payos.code !== '00' || !payos.data?.checkoutUrl) {
        throw new BadRequestException(
          payos.desc || 'PayOS từ chối tạo link thanh toán',
        );
      }
      await this.finesService.savePayOsCheckoutUrl(
        fine.id,
        payos.data.checkoutUrl,
      );
      return payos;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      const ax = err as AxiosError<{ desc?: string; message?: string }>;
      const msg =
        ax.response?.data?.desc ||
        ax.response?.data?.message ||
        ax.message ||
        'Lỗi gọi PayOS';
      this.logger.warn(
        `createPayment PayOS error: ${msg} descLen=${hardcodedDescription.length} response=${JSON.stringify(ax.response?.data ?? {})}`,
      );
      throw new BadRequestException(msg);
    }
  }

  async handleWebhook(
    body: PayosWebhookBodyPayload,
  ): Promise<{ received: boolean }> {
    if (!body.success || !body.data) {
      return { received: true };
    }
    const { orderCode, amount } = body.data;
    const result = await this.finesService.markAsPaidByPayOsWebhook(
      orderCode,
      amount,
    );
    if (!result.updated) {
      this.logger.warn(
        `Webhook PayOS: không tìm thấy khoản phạt với payment_code=${orderCode}`,
      );
    }
    return { received: true };
  }
}
