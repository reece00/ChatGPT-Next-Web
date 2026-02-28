import cn from "./cn";

import type { LocaleType } from "./cn";
export type { LocaleType, PartialLocaleType } from "./cn";

export type Lang = "cn";

export default cn as LocaleType;

export function getLang(): Lang {
  return "cn";
}

export function getISOLang() {
  return "zh-Hans";
}
