import { Dec, Int } from "@keplr-wallet/unit";

export const amountToAmbiguousString = (amount: { toDec: () => Dec }) => {
  if (amount.toDec().lte(new Dec(0))) {
    return "0";
  }

  if (amount.toDec().lt(new Dec(10))) {
    const n = amount.toDec().truncate();
    return `${n.toString()}~${n.add(new Int(1)).toString()}`;
  } else if (amount.toDec().lt(new Dec(100))) {
    const n = amount.toDec().quo(new Dec(10)).truncate();
    return `${n.mul(new Int(10)).toString()}~${n
      .add(new Int(1))
      .mul(new Int(10))
      .toString()}`;
  } else {
    const n = amount.toDec().quo(new Dec(100)).truncate();
    return `${n.mul(new Int(100)).toString()}~${n
      .add(new Int(1))
      .mul(new Int(100))
      .toString()}`;
  }
};

export const amountToAmbiguousAverage = (amount: { toDec: () => Dec }) => {
  const str = amountToAmbiguousString(amount);
  if (str === "0") {
    return 0;
  }

  const i = str.indexOf("~");
  if (i >= 0) {
    return (parseInt(str.substring(0, i)) + parseInt(str.substring(i + 1))) / 2;
  }

  return 0;
};
