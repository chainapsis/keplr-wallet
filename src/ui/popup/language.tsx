import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { IntlProvider } from "react-intl";

import MessagesEn from "./languages/en.json";
import MessagesKo from "./languages/ko.json";
import MessagesIt from "./languages/it.json";
import MessagesFr from "./languages/fr.json";
import MessagesRu from "./languages/ru.json";
import MessagesEs from "./languages/es.json";
import MessagesJp from "./languages/jp.json";

const messages: { [lang: string]: Record<string, string> } = {
  en: MessagesEn,
  ko: MessagesKo,
  it: MessagesIt,
  fr: MessagesFr,
  ru: MessagesRu,
  es: MessagesEs,
  jp: MessagesJp
};

function getMessages(language: string): Record<string, string> {
  return Object.assign({}, MessagesEn, messages[language]);
}

function initLanguage(): string {
  const language =
    localStorage.getItem("language") || navigator.language.split(/[-_]/)[0]; // language without region code

  if (!messages[language]) {
    return "en";
  }

  return language;
}

interface Language {
  language: string;
  automatic: boolean;
  setLanguage: (language: string) => void;
  clearLanguage: () => void;
}

const LanguageContext = React.createContext<Language | null>(null);

export const useLanguage = (): Language => {
  const lang = React.useContext(LanguageContext);
  if (!lang) {
    throw new Error("You have forgot to use intl provider");
  }
  return lang;
};

export const AppIntlProvider: FunctionComponent = props => {
  const [language, setLanguage] = useState(initLanguage());
  const [automatic, setAutomatic] = useState(
    localStorage.getItem("language") == null
  );
  const [messages, setMessages] = useState(getMessages(language));

  useEffect(() => {
    document.body.setAttribute("data-lang", language);
  }, [language]);

  useEffect(() => {
    setMessages(getMessages(language));
  }, [language]);

  const setLanguageCallback = useCallback((language: string) => {
    localStorage.setItem("language", language);
    setLanguage(language);
    setAutomatic(false);
  }, []);

  const clearLanguageCallback = useCallback(() => {
    localStorage.removeItem("language");
    setLanguage(initLanguage());
    setAutomatic(true);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language: language,
        automatic: automatic,
        setLanguage: setLanguageCallback,
        clearLanguage: clearLanguageCallback
      }}
    >
      <IntlProvider
        locale={language}
        messages={messages}
        key={`${language}${automatic ? "-auto" : ""}`}
      >
        {props.children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};
