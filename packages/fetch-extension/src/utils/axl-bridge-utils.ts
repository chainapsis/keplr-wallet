export const extractNumberFromBalance = (balanceString: string) => {
  // Use regular expression to extract the numeric part
  if (!balanceString) return 0;
  const regex = /(\d+(\.\d+)?)/;
  const match = balanceString.match(regex);
  if (match) {
    return parseFloat(match[0]);
  } else {
    return 0;
  }
};

export const formatEthBalance = (balanceString: string) => {
  const stringWithoutWei = balanceString.replace(/-wei/g, "");
  const regex = /([\d,]+)\s?([a-zA-Z]+)\s?\((.*?)\)/;
  const match = stringWithoutWei.match(regex);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));
    const denom = match[2];
    const additionalInfo = match[3];
    const ethAmount = amount / 10 ** 18;
    return `${ethAmount} ${denom.toUpperCase()} (${additionalInfo})`;
  } else {
    return "NaN";
  }
};

export const shortenBalance = (balanceString: string) => {
  const [value, denomination] = balanceString.split(" ");
  const [integerPart, decimalPart = ""] = value.split(".");
  if (decimalPart.length > 4) {
    const truncatedDecimal = decimalPart.slice(1, 5) + "...";
    const formattedValue = `${integerPart}.${truncatedDecimal}`;
    return `${formattedValue} ${denomination}`;
  }
  return balanceString;
};
