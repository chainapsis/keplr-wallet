import { Slip10RawIndex, stringToPath } from "@cosmjs/crypto";
import { UR } from "@keplr-wallet/stores";

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

export const decodeUR = (ur: UR) => {
  return {
    device: "",
    xfp: "",
    name: "",
    keys: [
      {
        ...parseHDPath("m/44'/118'/0'/0/0"),
        pubKey:
          "02bda203ca44c955f1db94bb0d34ef072cebeb27f5bc7b13656bb2881301d017a6",
        index: 0,
      },
      {
        ...parseHDPath("m/44'/60'/0'/0/0"),
        pubKey:
          "029e9fea62fb6dd737250b20fc1441c0fcb4f163402bae1ac6f2f0726116c88024",
        index: 1,
      },
    ],
    ur,
  };
};
