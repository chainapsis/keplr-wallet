import { IntlCache } from "../app/language-picker/react-intl-inject";

export const SECURITY_QUESTIONS = () => {
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
