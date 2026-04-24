import type { FineRulesResponse } from '@/types/fine.types'


export const DAMAGED_BOOK_FINE_FIXED_FALLBACK_VND = 50_000

export const LOST_BOOK_PROCESSING_FEE_FALLBACK_VND = 20_000

const RANK: Record<string, number> = {
  new: 0,
  good: 1,
  worn: 2,
  damaged: 3,
}

function conditionRank(condition: string | null | undefined): number {
  if (condition == null || condition === '') return RANK.good
  const key = condition.toLowerCase()
  return RANK[key] ?? RANK.good
}


export function isPhysicalConditionWorseThanAtBorrow(
  received: string,
  atBorrow: string | null | undefined,
): boolean {
  return conditionRank(received) > conditionRank(atBorrow ?? 'good')
}


export function physicalCopyFineReferenceAmount(
  copy:
    | {
        price?: number | null
        purchasePrice?: number | null
      }
    | undefined,
): number | null {
  if (!copy) return null
  if (copy.price != null) {
    const n = Number(copy.price)
    if (Number.isFinite(n) && n > 0) return n
  }
  if (copy.purchasePrice != null) {
    const n = Number(copy.purchasePrice)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}


export function computeDamagedBookFineAmount(
  rules: FineRulesResponse,
  referencePrice: number | null,
): number {
  const mode = rules.damagedBookFineMode
  const fixedAmt = rules.damagedBookFineFixed
  const pct = rules.damagedBookFinePercent
  const price = referencePrice != null ? Number(referencePrice) : 0
  if (mode === 'percent') {
    if (!Number.isFinite(price) || price <= 0) {
      return Math.round(fixedAmt)
    }
    return Math.round((price * pct) / 100)
  }
  return Math.round(fixedAmt)
}


export function computeLostBookFineAmount(
  rules: FineRulesResponse,
  referencePrice: number | null,
): number {
  if (rules.lostBookFineMode === 'fixed') {
    return Math.round(rules.lostBookProcessingFee)
  }
  const price = referencePrice != null ? Number(referencePrice) : 0
  const reimbursement =
    Number.isFinite(price) && price > 0
      ? (price * rules.lostBookReimbursePercent) / 100
      : 0
  return Math.round(reimbursement)
}
