import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import {IntlProvider} from 'react-intl';
import MessagesEn from './en.json';
import MessagesKo from './ko.json';
import {useStore} from '../stores';
import {observer} from 'mobx-react-lite';

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
  getLanguageFullName: (language: string) => string;
  setLanguage: (language: string) => void;
  automatic: boolean;
  clearLanguage: () => void;
}

const defaultLangMap: Record<string, string> = {
  ko: 'ko',
  en: 'en',
  en_US: 'en',
};

const initLanguage = (): string => {
  let language = 'en';
  if (!defaultLangMap[language]) {
    return 'en';
  }

  return language;
};

const LanguageContext = createContext<Language | null>(null);

export const useLanguage = (): Language => {
  const lang = useContext(LanguageContext);
  if (!lang) {
    throw new Error('You have forgot to use language provider');
  }
  return lang;
};

//TODO - 일단 최소만한 구현해놓음 이후 한글어 지원할때 익스텐션 코드보고 구현필요함
export const AppIntlProvider: FunctionComponent<PropsWithChildren> = observer(
  ({children}) => {
    const {uiConfigStore} = useStore();
    const language = uiConfigStore.language;
    const isAutomatic = uiConfigStore.languageIsAutomatic;

    const [messages, setMessages] = useState(
      uiConfigStore.languageIsAutomatic
        ? getMessages(initLanguage())
        : getMessages(uiConfigStore.language),
    );

    useLayoutEffect(() => {
      setMessages(getMessages(language));
    }, [language]);

    const clearLanguage = () => {
      const language = initLanguage();
      uiConfigStore.selectLanguageOptions({language, isAutomatic: true});
    };

    const setLanguage = (language: string) => {
      uiConfigStore.selectLanguageOptions({language, isAutomatic: false});
    };

    const getLanguageFullName = (language: string) => {
      switch (language) {
        case 'ko':
          return '한국어';
        default:
          return 'English';
      }
    };

    return (
      <LanguageContext.Provider
        value={{
          language,
          getLanguageFullName,
          languageFullName: getLanguageFullName(language),
          setLanguage,
          automatic: isAutomatic,
          clearLanguage,
        }}>
        <IntlProvider locale={language} messages={messages} key={language}>
          {children}
        </IntlProvider>
      </LanguageContext.Provider>
    );
  },
);
