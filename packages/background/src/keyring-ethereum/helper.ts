export const validateEVMChainId = (evmChainId: number) => {
  const isSafeEVMChainId =
    Number.isSafeInteger(evmChainId) &&
    evmChainId > 0 &&
    // The largest possible EVM chain ID.
    // Reference: https://gist.github.com/rekmarks/a47bd5f2525936c4b8eee31a16345553
    evmChainId <= 4503599627370476;
  if (!isSafeEVMChainId) {
    throw new Error(
      "EVM chain ID must be greater than 0 and lower than 4503599627370476."
    );
  }

  return evmChainId;
};
