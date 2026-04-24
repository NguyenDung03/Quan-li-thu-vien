
export function physicalCopyFineReferenceAmount(
  copy:
    | { price?: number | null; purchasePrice?: number | null }
    | undefined
    | null,
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

export function formatPhysicalCopyReferencePrice(
  copy:
    | { price?: number | null; purchasePrice?: number | null }
    | undefined
    | null,
  languageHint?: string,
): string {
  const ref = physicalCopyFineReferenceAmount(copy)
  if (ref == null) return "—"
  const locale = languageHint?.startsWith("en") ? "en-US" : "vi-VN"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(ref)
}
