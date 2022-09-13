import { messages } from "@obi-wallet/common";
import { createIntl, createIntlCache } from "react-intl";

import { useStore } from "../../app/stores";

export const GetCurrentLanguageStore = () => {
  const languageStore = useStore().languageStore;
  const language = languageStore.currentLanguage.languagecode;
  return language;
};

export const IntlCache = () => {
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
