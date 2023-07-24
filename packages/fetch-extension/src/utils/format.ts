import { AGENT_ADDRESS } from "../config.ui.var";

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

export const formatGroupName = (address: string) => {
  if (address?.length > 15)
    return (
      address.substring(0, 8) +
      "..." +
      address.substring(address.length - 6, address.length)
    );
  else return address;
};

export const formatTokenName = (name: string) => {
  if (name.length > 16) {
    return name.substring(0, 15) + "...";
  }

  return name;
};

export const shortenNumber = (value: string) => {
  const number = parseFloat(value) / 10 ** 18;
  let result = "";
  if (number >= 1000000) {
    result = (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    result = (number / 1000).toFixed(1) + "K";
  } else {
    result = number.toFixed(0);
  }

  return result;
};

export const formatActivityHash = (address: string) => {
  if (address?.length > 12) return address.substring(0, 10) + "...";
  else return address;
};

export const formatDomain = (domainName: string): string => {
  const maxLength = 15;

  if (domainName.length <= maxLength) {
    return domainName.toUpperCase();
  } else {
    const firstPart = domainName.slice(0, 4);
    const lastPart = domainName.slice(-8);
    return `${firstPart}...${lastPart}`.toUpperCase();
  }
};
