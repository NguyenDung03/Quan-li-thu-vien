import { createHmac } from 'node:crypto';

import { stripVietnameseDiacritics } from 'src/common/utils/strip-vietnamese-diacritics.util';

export function createPayOsPaymentRequestSignature(
  params: {
    amount: number;
    cancelUrl: string;
    description: string;
    orderCode: number;
    returnUrl: string;
  },
  checksumKey: string,
): string {
  const { amount, cancelUrl, description, orderCode, returnUrl } = params;
  const dataStr = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  return createHmac('sha256', checksumKey).update(dataStr).digest('hex');
}

export function sanitizePayOsDescription(raw: string, maxLength = 240): string {
  const s = stripVietnameseDiacritics(raw)
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
  return s.length > 0 ? s.slice(0, maxLength) : 'Thanh toan thu vien';
}

export function sortObjDataByKey(object: Record<string, unknown>) {
  const orderedObject = Object.keys(object)
    .sort()
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
  return orderedObject;
}

export function convertObjToQueryStr(object: Record<string, unknown>) {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];

      if (value && Array.isArray(value)) {
        value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
      }

      if ([null, undefined, 'undefined', 'null'].includes(value as string)) {
        value = '';
      }

      return `${key}=${value}`;
    })
    .join('&');
}

export function generateSignature(
  data: Record<string, unknown>,
  checksumKey: string,
) {
  const sortedDataByKey = sortObjDataByKey(data);
  const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
  const dataToSignature = createHmac('sha256', checksumKey)
    .update(dataQueryStr)
    .digest('hex');
  return dataToSignature;
}
