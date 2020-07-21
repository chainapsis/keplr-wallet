import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { IntlProvider } from "react-intl";

import MessagesEn from "./languages/en.json";
import MessagesKo from "./languages/ko.json";

export type IntlMessage = Record<string, string>;
export type IntlMessages = { [lang: string]: Record<string, string> };

const messages: IntlMessages = {
  en: MessagesEn,
  ko: MessagesKo
};

function getMessages(
  additionalMessages: IntlMessages,
  language: string
): IntlMessage {
  return Object.assign(
    {},
    MessagesEn,
    messages[language],
    additionalMessages[language]
  );
}

function initLanguage(additionalMessages: IntlMessages): string {
  const language =
    localStorage.getItem("language") || navigator.language.split(/[-_]/)[0]; // language without region code

  if (!messages[language] && !additionalMessages[language]) {
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

export const AppIntlProvider: FunctionComponent<{
  additionalMessages: IntlMessages;
}> = ({ additionalMessages, children }) => {
  const [language, setLanguage] = useState(initLanguage(additionalMessages));
  const [automatic, setAutomatic] = useState(
    localStorage.getItem("language") == null
  );
  const [messages, setMessages] = useState(
    getMessages(additionalMessages, language)
  );

  useEffect(() => {
    document.body.setAttribute("data-lang", language);
  }, [language]);

  useEffect(() => {
    setMessages(getMessages(additionalMessages, language));
  }, [additionalMessages, language]);

  const setLanguageCallback = useCallback((language: string) => {
    localStorage.setItem("language", language);
    setLanguage(language);
    setAutomatic(false);
  }, []);

  const clearLanguageCallback = useCallback(() => {
    localStorage.removeItem("language");
    setLanguage(initLanguage(additionalMessages));
    setAutomatic(true);
  }, [additionalMessages]);

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
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};
