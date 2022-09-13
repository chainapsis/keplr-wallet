import { messages } from "@obi-wallet/common";
import { createIntl, createIntlCache } from "react-intl";

import { useStore } from "../app/stores";

export const SECURITY_QUESTIONS = () => {
  const GetCurrentLanguageStore = () => {
    const languageStore = useStore().languageStore;
    const language = languageStore.currentLanguage.languagecode;
    return language;
  };

  const IntlCache = () => {
    const intlCache = createIntlCache();
    const intl = createIntl(
      {
        defaultLocale: "en",
        locale: GetCurrentLanguageStore(),
        messages: messages[GetCurrentLanguageStore()],
      },
      intlCache
    );
    return intl;
  };

  const securityQuestions = [
    {
      label: IntlCache().formatMessage({
        id: "onboarding2.securityquestion.birthplace",
        defaultMessage: "What city were you born in?",
      }),
      value: "birthplace",
    },
    {
      label: IntlCache().formatMessage({
        id: "onboarding2.securityquestion.schoolname",
        defaultMessage:
          "What is the full name of the last elementary/primary school I attended?",
      }),
      value: "schoolname",
    },
    {
      label: IntlCache().formatMessage({
        id: "onboarding2.securityquestion.mothersmaidenname",
        defaultMessage: "What is your mother's maiden name?",
      }),
      value: "mothersmaidenname",
    },
    {
      label: IntlCache().formatMessage({
        id: "onboarding2.securityquestion.nickname",
        defaultMessage: "What was your childhood nickname?",
      }),
      value: "nickname",
    },
    {
      label: IntlCache().formatMessage({
        id: "onboarding2.securityquestion.firstcar",
        defaultMessage: "What was the make of your first car?",
      }),
      value: "firstcar",
    },
    {
      label: IntlCache().formatMessage({
        id: "onboarding2.securityquestion.firstkiss",
        defaultMessage: "What is the full name of my first kiss?",
      }),
      value: "firstkiss",
    },
  ];

  return securityQuestions;
};
