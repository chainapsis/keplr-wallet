import { Slip10RawIndex, stringToPath } from "@cosmjs/crypto";

export const toNumber = (num: Slip10RawIndex) =>
  num.toNumber() - (num.isHardened() ? 2 ** 31 : 0);

export const parseHDPath = (hdPath: string) => {
  const path = stringToPath(hdPath);
  return {
    coinType: toNumber(path[1]),
    bip44HDPath: {
      account: toNumber(path[2]),
      change: toNumber(path[3]),
      addressIndex: toNumber(path[4]),
    },
  };
};
