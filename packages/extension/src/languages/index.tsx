import React, { FunctionComponent, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

import MessagesEn from "./en.json";
import MessagesKo from "./ko.json";

export type IntlMessage = Record<string, string>;
export type IntlMessages = { [lang: string]: Record<string, string> };

const messages: IntlMessages = {
  en: MessagesEn,
  ko: MessagesKo,
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

  fiatCurrency: string;
  isFiatCurrencyAutomatic: boolean;
  // Set the fiat currency. If the argument is null, it will set the fiat currency automatically.
  setFiatCurrency: (fiatCurrency: string | null) => void;
}

const LanguageContext = React.createContext<Language | null>(null);

export const useLanguage = (): Language => {
  const lang = React.useContext(LanguageContext);
  if (!lang) {
    throw new Error("You have forgot to use language provider");
  }
  return lang;
};

export type LanguageToFiatCurrency = { ["default"]: string } & {
  [language: string]: string | undefined;
};

export const AppIntlProvider: FunctionComponent<{
  additionalMessages: IntlMessages;
  // Set the fiat currency according to the language if the fiat currency is not set (automatic).
  languageToFiatCurrency: LanguageToFiatCurrency;
}> = ({ additionalMessages, languageToFiatCurrency, children }) => {
  const [language, _setLanguage] = useState(() =>
    initLanguage(additionalMessages)
  );
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

  const setLanguage = (language: string) => {
    localStorage.setItem("language", language);
    _setLanguage(language);
    setAutomatic(false);
  };

  const clearLanguage = () => {
    localStorage.removeItem("language");
    _setLanguage(initLanguage(additionalMessages));
    setAutomatic(true);
  };

  const [_fiatCurrency, _setFiatCurrency] = useState<string | null>(
    localStorage.getItem("fiat-currency")
  );

  const setFiatCurrency = (fiatCurrency: string | null) => {
    if (fiatCurrency === null) {
      localStorage.removeItem("fiat-currency");
    } else {
      localStorage.setItem("fiat-currency", fiatCurrency);
    }

    _setFiatCurrency(fiatCurrency);
  };

  let fiatCurrency = _fiatCurrency;
  if (fiatCurrency === null) {
    const saved = localStorage.getItem("fiat-currency");
    if (saved !== null) {
      fiatCurrency = saved;
    } else {
      fiatCurrency =
        languageToFiatCurrency[language] || languageToFiatCurrency["default"];
    }
  }

  const isFiatCurrencyAutomatic = _fiatCurrency === null;

  return (
    <LanguageContext.Provider
      value={{
        language: language,
        automatic: automatic,
        setLanguage,
        clearLanguage,
        fiatCurrency,
        setFiatCurrency,
        isFiatCurrencyAutomatic,
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
