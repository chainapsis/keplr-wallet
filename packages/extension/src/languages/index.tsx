import React, {
  createContext,
  FunctionComponent,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import { IntlProvider } from "react-intl";
import MessagesEn from "./en.json";
import MessagesKo from "./ko.json";

export type IntlMessage = Record<string, string>;
export type IntlMessages = {
  [lang: string]: Record<string, string> | undefined;
};

const messages: IntlMessages = {
  en: MessagesEn,
  ko: MessagesKo,
};

const getMessages = (language: string): IntlMessage => {
  return Object.assign({}, MessagesEn, messages[language]);
};

interface Language {
  language: string;
  languageFullName: string;
  setLanguage: (language: string) => void;
  automatic: boolean;
  clearLanguage: () => void;
}

const defaultLangMap: Record<string, string> = {
  ko: "ko",
  en: "en",
};

const initLanguage = (): string => {
  const language =
    localStorage.getItem("language") || navigator.language.split(/[-_]/)[0];

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

export const AppIntlProvider: FunctionComponent = ({ children }) => {
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

  const languageFullName = () => {
    switch (language) {
      case "ko":
        return "한국어";
      default:
        return "English";
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageFullName: languageFullName(),
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
