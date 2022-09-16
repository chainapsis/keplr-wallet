import { messages } from "@obi-wallet/common";
import { createIntl, createIntlCache } from "react-intl";

import { useStore } from "../../app/stores";

export const GetCurrentLanguageStore = () => {
  const { languageStore } = useStore();
  return languageStore.currentLanguage;
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
