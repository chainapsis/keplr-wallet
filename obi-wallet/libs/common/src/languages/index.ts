import MessagesDe from "./de.json";
import MessagesEn from "./en.json";
import MessagesEs from "./es.json";

export type IntlMessage = Record<string, any>;
export type IntlMessages = { [lang: string]: Record<string, any> };

export const messages: IntlMessages = {
  en: MessagesEn,
  de: MessagesDe,
  es: MessagesEs,
};

export type TypeLanguageToFiatCurrency = { ["default"]: string } & {
  [language: string]: string | undefined;
};
