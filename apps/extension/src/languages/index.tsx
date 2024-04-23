import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import { IntlProvider } from "react-intl";
import MessagesEn from "./en.json";
import MessagesKo from "./ko.json";
import MessagesZhCn from "./zh-cn.json";

export type IntlMessage = Record<string, string>;
export type IntlMessages = {
  [lang: string]: Record<string, string> | undefined;
};

const messages: IntlMessages = {
  en: MessagesEn,
  ko: MessagesKo,
  "zh-cn": MessagesZhCn,
};

const getMessages = (language: string): IntlMessage => {
  return Object.assign({}, MessagesEn, messages[language]);
};

interface Language {
  language: string;
  languageFullName: string;
  getLanguageFullName: (language: string) => string;
  setLanguage: (language: string) => void;
  automatic: boolean;
  clearLanguage: () => void;
}

const defaultLangMap: Record<string, string> = {
  ko: "ko",
  en: "en",
  "zh-cn": "zh-cn",
};

const initLanguage = (): string => {
  const originalLang =
    localStorage.getItem("language") || navigator.language.toLowerCase();
  const langParts = originalLang.split(/[-_]/);
  let language = langParts[0];

  if (language === "zh") {
    language =
      langParts.length === 1 ? "zh-cn" : langParts.slice(0, 2).join("-");
  }

  if (!defaultLangMap[language]) {
    return "en";
  }

  return language;
};

const LanguageContext = createContext<Language | null>(null);

export const useLanguage = (): Language => {
  const lang = useContext(LanguageContext);
  if (!lang) {
    throw new Error("You have forgot to use language provider");
  }
  return lang;
};

export const AppIntlProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [language, _setLanguage] = useState<string>(() => initLanguage());
  const [messages, setMessages] = useState(getMessages(language));

  const [automatic, setAutomatic] = useState(!localStorage.getItem("language"));

  const clearLanguage = () => {
    localStorage.removeItem("language");
    _setLanguage(initLanguage());
    setAutomatic(true);
  };

  useLayoutEffect(() => {
    document.body.setAttribute("data-lang", language);
    setMessages(getMessages(language));
  }, [language]);

  const setLanguage = (language: string) => {
    localStorage.setItem("language", language);
    _setLanguage(language);
    setAutomatic(false);
  };

  const getLanguageFullName = (language: string) => {
    switch (language) {
      case "ko":
        return "한국어";
      case "zh-cn":
        return "简体中文";
      default:
        return "English";
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        getLanguageFullName,
        languageFullName: getLanguageFullName(language),
        setLanguage,
        automatic,
        clearLanguage,
      }}
    >
      <IntlProvider locale={language} messages={messages} key={language}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};
