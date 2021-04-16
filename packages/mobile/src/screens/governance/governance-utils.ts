import { Dec } from "@keplr-wallet/unit";

export const calculateTotalInDec = (numbersToadd: Array<string>) => {
  let total = new Dec(0);
  numbersToadd.forEach(num => {
    const numToAdd = new Dec(num);
    total = total.add(numToAdd);
  });
  return total;
};

export const parseTime = (date: string) => {
  const dividedByTime = date.split("T");
  const yearMonthDate = dividedByTime[0];
  const hourMinuteSecond = dividedByTime[1].substr(0, 5);

  // TODO: UTC-0 기준으로 나오고 로컬 타임존으로 안나오는 문제가 있음
  return `${yearMonthDate} ${hourMinuteSecond} UTC`;
};
