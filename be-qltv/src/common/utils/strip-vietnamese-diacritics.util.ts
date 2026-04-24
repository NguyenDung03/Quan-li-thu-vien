export function stripVietnameseDiacritics(input: string): string {
  if (!input) {
    return '';
  }
  return input
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
