export type TaxCaps = {
  tax_caps:
    | {
        denom: string;
        tax_cap: string;
      }[]
    | null;
};

export type TaxRate = {
  tax_rate: string;
};
