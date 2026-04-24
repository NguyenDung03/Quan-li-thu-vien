
export function getPayOsReturnUrls(): { returnUrl: string; cancelUrl: string } {
  const fromEnvReturn = import.meta.env.VITE_PAYOS_RETURN_URL as string | undefined;
  const fromEnvCancel = import.meta.env.VITE_PAYOS_CANCEL_URL as string | undefined;

  if (fromEnvReturn?.trim() && fromEnvCancel?.trim()) {
    return { returnUrl: fromEnvReturn.trim(), cancelUrl: fromEnvCancel.trim() };
  }

  const origin =
    typeof globalThis !== "undefined" && globalThis.location?.origin
      ? globalThis.location.origin
      : "";

  return {
    returnUrl: `${origin}/thanh-toan-thanh-cong`,
    cancelUrl: `${origin}/thanh-toan-that-bai`,
  };
}
