import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '@/locales/en/common.json'
import vnCommon from '@/locales/vn/common.json'
import enReader from '@/locales/en/reader.json'
import vnReader from '@/locales/vn/reader.json'
import enBorrowRecord from '@/locales/en/borrow-record.json'
import vnBorrowRecord from '@/locales/vn/borrow-record.json'
import enPhysicalCopyEnums from '@/locales/en/physical-copy-enums.json'
import vnPhysicalCopyEnums from '@/locales/vn/physical-copy-enums.json'

const resources = {
  en: {
    common: enCommon,
    reader: enReader,
    borrowRecord: enBorrowRecord,
    physicalCopyEnums: enPhysicalCopyEnums,
  },
  vn: {
    common: vnCommon,
    reader: vnReader,
    borrowRecord: vnBorrowRecord,
    physicalCopyEnums: vnPhysicalCopyEnums,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vn',
    lng: 'vn',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
