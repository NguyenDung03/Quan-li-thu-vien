import api from "@/lib/api";

export interface CreateFinePaymentBody {
  fineId: string;
  description?: string;
  amount?: number;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayosPaymentCreatedResponse {
  code: string;
  desc: string;
  data: {
    checkoutUrl: string;
    amount: number;
    description: string;
    orderCode: number;
    status: string;
    [key: string]: unknown;
  };
  signature: string;
}

export interface RenewBorrowPayOsBody {
  returnUrl?: string;
  cancelUrl?: string;
}

export async function createFinePayOsCheckout(
  body: CreateFinePaymentBody,
): Promise<PayosPaymentCreatedResponse> {
  const { data } = await api.post<PayosPaymentCreatedResponse>("/payments", body);
  return data;
}

export async function createRenewalPayOsCheckout(
  borrowRecordId: string,
  body: RenewBorrowPayOsBody,
): Promise<PayosPaymentCreatedResponse> {
  const { data } = await api.post<PayosPaymentCreatedResponse>(
    `/borrow-records/${borrowRecordId}/renew`,
    body,
  );
  return data;
}
