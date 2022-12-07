export type SupplyTotal = {
  amount: {
    denom: string;
    amount: string;
  };
};

export type MintingInflation = {
  // Dec
  inflation: string;
};

export type EpochProvisions = {
  epoch_provisions: string;
};
