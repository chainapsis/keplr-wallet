import { Buffer } from "buffer/";
import { AGENT_ADDRESS } from "../../config";

export const separateNumericAndDenom = (value: any) => {
  const [numericPart, denomPart] = value ? value.split(" ") : ["", ""];
  return { numericPart, denomPart };
};

export const parseDollarAmount = (dollarString: any) => {
  const match = dollarString.match(/[0-9.]+/);
  if (match) {
    return parseFloat(match[0]);
  }
  return 0;
};
export const formatActivityHash = (address: string) => {
  if (address?.length > 12) return address.substring(0, 10) + "...";
  else return address;
};
export const formatAddress = (address: string) => {
  if (Object.values(AGENT_ADDRESS).includes(address)) return "Fetchbot";
  if (address?.length > 15)
    return (
      address.substring(0, 8).toLowerCase() +
      "..." +
      address.substring(36, 44).toLowerCase()
    );
  else return address;
};
export function trimWordsStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const splited = str.split(/\s+/);
  const words = splited
    .map((word) => word.trim())
    .filter((word) => word.trim().length > 0);
  return words.join(" ");
}

export function isPrivateKey(str: string): boolean {
  if (str.startsWith("0x")) {
    return true;
  }

  if (str.length === 64) {
    try {
      return Buffer.from(str, "hex").length === 32;
    } catch {
      return false;
    }
  }
  return false;
}

export function validatePrivateKey(value: string): boolean {
  if (isPrivateKey(value)) {
    value = value.replace("0x", "");
    if (value.length !== 64) {
      return false;
    }
    return (
      Buffer.from(value, "hex").toString("hex").toLowerCase() ===
      value.toLowerCase()
    );
  }
  return false;
}

export function titleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase());
}
export const shortenNumber = (value: string, decimal = 18) => {
  const number = Math.abs(parseFloat(value)) / 10 ** decimal;
  let result = "";
  if (number >= 1000000) {
    result = (number / 1000000).toFixed(2) + " M";
  } else if (number >= 1000) {
    result = (number / 1000).toFixed(2) + " K";
  } else if (number >= 1) {
    result = number.toFixed(2) + " ";
  } else if (number >= 10 ** -3) {
    result = (number * 1000).toFixed(2) + " m";
  } else if (number >= 10 ** -6) {
    result = (number * 10 ** 6).toFixed(2) + " u";
  } else if (number >= 10 ** -9) {
    result = (number * 10 ** 9).toFixed(2) + " n";
  } else if (number >= 10 ** -12) {
    result = (number * 10 ** 9).toFixed(3) + " n";
  } else if (number >= 10 ** -18) {
    result = (number * 10 ** 18).toFixed(0) + " a";
  } else {
    result = number.toFixed(2) + " ";
  }
  return result;
};
