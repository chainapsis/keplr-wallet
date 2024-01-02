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

export const dateToLocalStringFormatGMT = (
  intl: IntlShape,
  dateStr: string
) => {
  if (!dateStr) {
    return;
  }
  return intl.formatDate(dateStr, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};
