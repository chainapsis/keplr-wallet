import { IntlShape } from "react-intl";

export const dateToLocalString = (intl: IntlShape, dateStr: string) => {
  if (!dateStr) {
    return;
  }

  const current = new Date();
  const date = new Date(dateStr);
  const isYearDifferent = current.getFullYear() !== date.getFullYear();

  return intl
    .formatDate(dateStr, {
      format: "en",
      year: isYearDifferent ? "numeric" : undefined,
    })
    .replace("GMT", "UTC");
};
