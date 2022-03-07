const regexIntString = /^-?\d+$/;
const regexDecString = /^-?\d+.?\d*$/;
const regexExponentDecString = /^(-?)([\d.]+)e([-+])([\d]+)$/;

export function isValidIntegerString(str: string): boolean {
  return regexIntString.test(str);
}

export function isValidDecimalString(str: string): boolean {
  return regexDecString.test(str);
}

export function isExponentDecString(str: string): boolean {
  return regexExponentDecString.test(str);
}

function makeZerosStr(len: number): string {
  let r = "";
  for (let i = 0; i < len; i++) {
    r += "0";
  }
  return r;
}

function removeHeadZeros(str: string): string {
  while (str.length > 0 && str[0] === "0") {
    str = str.slice(1);
  }
  if (str.length === 0 || str[0] === ".") {
    return "0" + str;
  }
  return str;
}

export function exponentDecStringToDecString(str: string): string {
  const split = str.split(regexExponentDecString);
  if (split.length !== 6) {
    return str;
  }

  const isNeg = split[1] === "-";
  let numStr = split[2];
  const numStrFractionIndex = numStr.indexOf(".");

  const exponentStr = split[4];
  let exponent = parseInt(exponentStr) * (split[3] === "-" ? -1 : 1);

  if (numStrFractionIndex >= 0) {
    const fractionLen = numStr.length - numStrFractionIndex - 1;
    exponent = exponent - fractionLen;

    numStr = removeHeadZeros(numStr.replace(".", ""));
  }

  const prefix = isNeg ? "-" : "";

  if (exponent < 0) {
    if (numStr.length > -exponent) {
      const fractionPosition = numStr.length + exponent;

      return (
        prefix +
        (numStr.slice(0, fractionPosition) +
          "." +
          numStr.slice(fractionPosition))
      );
    }

    return prefix + "0." + makeZerosStr(-(numStr.length + exponent)) + numStr;
  } else {
    return prefix + numStr + makeZerosStr(exponent);
  }
}
