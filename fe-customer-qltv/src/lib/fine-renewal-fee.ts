const PREFIX = "[RENEWAL_FEE]";


export function isRenewalFeeFineReason(reason: string | undefined): boolean {
  if (!reason) return false;
  return reason.trim().startsWith(PREFIX);
}
