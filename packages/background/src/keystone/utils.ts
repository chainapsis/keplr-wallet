export const toNumber = (num: string) => {
  const isHardened = /'$/.test(num);
  return isHardened ? +num.slice(0, -1) : +num;
};

export const parseHDPath = (hdPath: string) => {
  const path = hdPath.split(/\//);
  return {
    coinType: toNumber(path[2]),
    bip44HDPath: {
      account: toNumber(path[3]),
      change: toNumber(path[4]),
      addressIndex: toNumber(path[5]),
    },
  };
};
