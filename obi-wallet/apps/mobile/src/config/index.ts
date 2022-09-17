import { useIntl } from "react-intl";

export function useSecurityQuestions() {
  const intl = useIntl();

  return [
    {
      label: intl.formatMessage({
        id: "onboarding2.securityquestion.birthplace",
        defaultMessage: "What city and country were you born in?",
      }),
      value: "birthplace",
    },
    {
      label: intl.formatMessage({
        id: "onboarding2.securityquestion.schoolname",
        defaultMessage:
          "What is the full name of the last elementary/primary school I attended?",
      }),
      value: "schoolname",
    },
    {
      label: intl.formatMessage({
        id: "onboarding2.securityquestion.firstcar",
        defaultMessage: "What was the make and model of your first car?",
      }),
      value: "firstcar",
    },
    {
      label: intl.formatMessage({
        id: "onboarding2.securityquestion.firstkiss",
        defaultMessage: "What is the full name of my first kiss?",
      }),
      value: "firstkiss",
    },
  ];
}
