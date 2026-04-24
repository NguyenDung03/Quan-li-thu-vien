import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "@/locales/en/common.json";
import enPages from "@/locales/en/pages.json";
import vnCommon from "@/locales/vn/common.json";
import vnPages from "@/locales/vn/pages.json";

const resources = {
  en: { common: enCommon, pages: enPages },
  vn: { common: vnCommon, pages: vnPages },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ["en", "vn"],
    fallbackLng: "vn",
    load: "languageOnly",
    defaultNS: "common",
    ns: ["common", "pages"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "qltv-reader-lang",
    },
  });

export default i18n;
