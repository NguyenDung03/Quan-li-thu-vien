export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

export interface Payment {
  id: string;

  orderId: string;

  userId: string;
  amount: number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  metadata: Record<string, unknown>;
  paymentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  fineId?: string | null;
}
