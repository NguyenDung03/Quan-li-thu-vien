import i18n from "@/i18n";


export function readerDateLocale(): string {
  return i18n.language?.startsWith("en") ? "en-US" : "vi-VN";
}
