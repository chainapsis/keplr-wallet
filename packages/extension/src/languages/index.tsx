import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import { IntlProvider } from "react-intl";
import MessagesEn from "./en.json";
import MessagesKo from "./ko.json";

interface Language {
  language: string;
  languageFullName: string;
  setLanguage: (language: string) => void;
}

const initLanguage = (): string => {
  return localStorage.getItem("language") || "en";
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
  const [language, _setLanguage] = useState<string>(initLanguage());

  useEffect(() => {
    document.body.setAttribute("data-lang", language);
  }, [language]);

  const setLanguage = (language: string) => {
    localStorage.setItem("language", language);
    _setLanguage(language);
  };

  const languageFullName = () => {
    switch (language) {
      case "ko":
        return "Korean";
      default:
        return "English";
    }
  };

  const getMessages = () => {
    switch (language) {
      case "ko":
        return MessagesKo;
      default:
        return MessagesEn;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language: language,
        languageFullName: languageFullName(),
        setLanguage,
      }}
    >
      <IntlProvider locale={language} messages={getMessages()} key={language}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};
