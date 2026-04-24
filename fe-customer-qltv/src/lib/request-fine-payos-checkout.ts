import {
  createFinePayOsCheckout,
  createRenewalPayOsCheckout,
} from "@/apis/payment.api";
import type { Fine } from "@/types/fine.type";
import { isRenewalFeeFineReason } from "@/lib/fine-renewal-fee";
import { getPayOsReturnUrls } from "@/lib/payos-urls";


export async function requestFinePayOsRedirect(fine: Fine): Promise<void> {
  const fineId = fine.id;
  const borrowRecordId = fine.borrowRecord?.id ?? fine.borrowId;
  if (!fineId || !borrowRecordId) {
    throw new Error("INVALID_FINE");
  }

  const { returnUrl, cancelUrl } = getPayOsReturnUrls();
  const isRenewal = isRenewalFeeFineReason(fine.reason);
  const res = isRenewal
    ? await createRenewalPayOsCheckout(borrowRecordId, { returnUrl, cancelUrl })
    : await createFinePayOsCheckout({ fineId, returnUrl, cancelUrl });

  const checkoutUrl = res?.data?.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error("MISSING_CHECKOUT_URL");
  }

  globalThis.location.href = checkoutUrl;
}


export async function requestBorrowRenewPayOsRedirect(
  borrowRecordId: string,
): Promise<void> {
  const { returnUrl, cancelUrl } = getPayOsReturnUrls();
  const res = await createRenewalPayOsCheckout(borrowRecordId, {
    returnUrl,
    cancelUrl,
  });
  const checkoutUrl = res?.data?.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error("MISSING_CHECKOUT_URL");
  }
  globalThis.location.href = checkoutUrl;
}
