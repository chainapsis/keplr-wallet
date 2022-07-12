import MessagesEn from "./en.json";

export type IntlMessage = Record<string, string>;
export type IntlMessages = { [lang: string]: Record<string, string> };

export const messages: IntlMessages = {
  en: MessagesEn,
};
