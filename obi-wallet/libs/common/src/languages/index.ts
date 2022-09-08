import MessagesDe from "./de.json";
import MessagesEn from "./en.json";

export type IntlMessage = Record<string, string>;
export type IntlMessages = { [lang: string]: Record<string, string> };

export const messages: IntlMessages = {
  en: MessagesEn,
  de: MessagesDe
};

export type TypeLanguageToFiatCurrency = { ["default"]: string } & {
  [language: string]: string | undefined;
};
