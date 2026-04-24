import { stripVietnameseDiacritics } from './strip-vietnamese-diacritics.util';

export const FINE_REASON_PREFIX_RENEWAL_FEE = '[RENEWAL_FEE]';

export function isRenewalFeeFineReason(reason: string): boolean {
  const t = reason.trim();
  if (t.startsWith(FINE_REASON_PREFIX_RENEWAL_FEE)) {
    return true;
  }
  const n = stripVietnameseDiacritics(t).toLowerCase().replace(/\s+/g, ' ');
  return n.includes('phi gia han');
}
