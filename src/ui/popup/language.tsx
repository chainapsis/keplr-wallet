import React, { FunctionComponent } from "react";
import { IntlProvider } from "react-intl";

import MessagesEn from "./languages/en.json";
import MessagesKo from "./languages/ko.json";

const messages: { [lang: string]: Record<string, string> } = {
  en: MessagesEn,
  ko: MessagesKo
};

function getMessages(): { language: string; messages: Record<string, string> } {
  const language = navigator.language.split(/[-_]/)[0]; // language without region code

  if (!messages[language]) {
    return { language: "en", messages: messages["en"] };
  }

  return {
    language,
    messages: Object.assign(messages["en"], messages[language])
  };
}

export const AppIntlProvider: FunctionComponent = props => {
  const { language, messages } = getMessages();

  return (
    <IntlProvider locale={language} messages={messages}>
      {props.children}
    </IntlProvider>
  );
};
