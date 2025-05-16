export const makeSureUTF8String = (string: string) => {
  const isHexString = /^[0-9A-Fa-f]+$/.test(string) && string.length % 2 === 0;
  if (isHexString) {
    try {
      return Buffer.from(string, "hex").toString("utf8");
    } catch (e) {
      return string;
    }
  }
  return string;
};
