export interface ITxChainSetter {
  chainId: string;
  setChain(chainId: string): void;
}

export interface UIProperties {
  // There is an error that cannot proceed the tx.
  readonly error?: Error;
  // Able to handle tx but prefer to show warning
  readonly warning?: Error;
  // Prefer that the loading UI is displayed.
  // In the case of "loading-block", the UI should handle it so that the user cannot proceed until loading is completed.
  readonly loadingState?: "loading" | "loading-block";
}

export interface ISenderConfig extends ITxChainSetter {
  value: string;
  setValue(value: string): void;

  sender: string;

  uiProperties: UIProperties;
}

export interface IGasConfig extends ITxChainSetter {
  value: string;
  setValue(value: string | number): void;

  gas: number;

  uiProperties: UIProperties;
}

export interface IRecipientConfig extends ITxChainSetter {
  value: string;
  setValue(value: string): void;

  recipient: string;

  uiProperties: UIProperties;
}
