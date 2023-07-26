const CONVENTIONAL_DECIMAL_PLACES = 2;
const MAX_DECIMAL_PLACES = 100;

const roundToDecimalPlaces = (rightOfDecimalStr = "", decimalPlaces = 0) => {
  // If rightOfDecimalStr isn't long enough, pad with 0s
  const strPadded = rightOfDecimalStr.padEnd(decimalPlaces, "0");
  // This is rounding down to the floor
  const strRounded = strPadded.substring(0, decimalPlaces);
  return strRounded;
};

const calcTrailingZeros = (value: bigint) => {
  let zeroes = 0;
  while (value > BigInt(0) && value % BigInt(10) === BigInt(0)) {
    zeroes += 1;
    value /= BigInt(10);
  }
  return zeroes;
};

export const stringifyNat = (natValue: bigint, decimalPlaces = 0) => {
  if (natValue === null) {
    return "";
  }

  let placesToShow = Math.max(
    Math.min(decimalPlaces, CONVENTIONAL_DECIMAL_PLACES),
    natValue > BigInt(0) ? decimalPlaces - calcTrailingZeros(natValue) : 0
  );

  if (placesToShow > MAX_DECIMAL_PLACES) {
    placesToShow = MAX_DECIMAL_PLACES;
  }
  if (decimalPlaces > MAX_DECIMAL_PLACES) {
    natValue /= BigInt(10) ** BigInt(decimalPlaces - MAX_DECIMAL_PLACES);
    decimalPlaces = MAX_DECIMAL_PLACES;
  }

  const str = `${natValue}`.padStart(decimalPlaces, "0");
  const leftOfDecimalStr = str.substring(0, str.length - decimalPlaces) || "0";
  const rightOfDecimalStr = roundToDecimalPlaces(
    `${str.substring(str.length - decimalPlaces)}`,
    placesToShow
  );

  if (rightOfDecimalStr === "") {
    return leftOfDecimalStr;
  }

  return `${leftOfDecimalStr}.${rightOfDecimalStr}`;
};

export const displayAmount = (
  displayInfo: { assetKind: string; decimalPlaces: number; petname: string },
  value: bigint | Array<any>
) => {
  if (displayInfo.assetKind === "nat") {
    return `${stringifyNat(value as bigint, displayInfo.decimalPlaces)} ${
      displayInfo.petname
    }`;
  }

  return `${(value as Array<any>).length} ${displayInfo.petname}`;
};
