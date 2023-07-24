export const validateAgentAddress = (address: string): boolean => {
  if (!address.startsWith("agent")) return true;
  if (/^[a-zA-Z0-9]+$/.test(address) && address.length === 65) return false;

  return true;
};

export const shortenAgentAddress = (address: string) => {
  return address.slice(0, 20) + "..." + address.slice(52, 64);
};
