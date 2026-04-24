import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';

import { PayosWebhookBodyPayload } from '../dto/payos-webhook-body.payload';
import { convertObjToQueryStr, sortObjDataByKey } from '../payos-utils';

@Injectable()
export class PaymentWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  isValidData(
    data: Record<string, unknown>,
    currentSignature: string,
    checksumKey: string,
  ) {
    const sortedDataByKey = sortObjDataByKey(data);
    const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
    const dataToSignature = createHmac('sha256', checksumKey)
      .update(dataQueryStr)
      .digest('hex');
    const a = Buffer.from(dataToSignature, 'utf8');
    const b = Buffer.from(String(currentSignature), 'utf8');
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  }

  canActivate(context: ExecutionContext): boolean {
    try {
      const req = context.switchToHttp().getRequest<Request>();
      const CHECKSUM_KEY =
        this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY');

      const body = req.body as unknown as PayosWebhookBodyPayload;

      const isValidPayload = this.isValidData(
        body.data as unknown as Record<string, unknown>,
        body.signature,
        CHECKSUM_KEY,
      );
      if (!isValidPayload) {
        throw new UnauthorizedException('Invalid payload');
      }

      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid payload');
    }
  }
}
