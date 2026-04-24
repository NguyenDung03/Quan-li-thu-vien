export function physicalCopyFineReferencePrice(copy: {
  price?: number | string | null;
  purchasePrice?: number | string | null;
}): number | null {
  const rawPrice = copy.price;
  if (rawPrice != null && rawPrice !== '') {
    const n = Number(rawPrice);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const rawPurchase = copy.purchasePrice;
  if (rawPurchase != null && rawPurchase !== '') {
    const n = Number(rawPurchase);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}
