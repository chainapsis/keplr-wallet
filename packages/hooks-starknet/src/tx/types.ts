import { ERC20Currency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { NameService } from "./name-service";
import { IModularChainInfoImpl } from "@keplr-wallet/stores";

export interface ITxChainSetter {
  chainId: string;
  setChain(chainId: string): void;
  modularChainInfo: IModularChainInfoImpl;
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

export interface GasEstimate {
  l1Gas: {
    consumed: string;
    price: string;
  };
  l1DataGas: {
    consumed: string;
    price: string;
  };
  l2Gas: {
    consumed: string;
    price: string;
  };
}

export type FeeType = "STRK";

export interface IGasConfig extends ITxChainSetter {
  value: string;
  gasAdjustmentValue: string;

  setValue(value: string | number): void;
  setGasAdjustmentValue(gasAdjustment: string | number): void;

  gas: number;
  maxGas: number;
  gasAdjustment: number;

  uiProperties: UIProperties;
}

export interface ISenderConfig extends ITxChainSetter {
  value: string;
  setValue(value: string): void;

  sender: string;

  uiProperties: UIProperties;
}

export interface IFeeConfig extends ITxChainSetter {
  type: FeeType;
  setType(type: FeeType): void;

  gasPrice: CoinPretty | undefined;
  maxGasPrice: CoinPretty | undefined;
  setGasPrice(
    gasPrice:
      | {
          gasPrice: CoinPretty;
          maxGasPrice: CoinPretty;
        }
      | undefined
  ): void;

  fee: CoinPretty | undefined;
  maxFee: CoinPretty | undefined;

  uiProperties: UIProperties;
}

export interface IRecipientConfig extends ITxChainSetter {
  value: string;
  setValue(value: string): void;

  recipient: string;

  uiProperties: UIProperties;
}

export interface IRecipientConfigWithNameServices extends IRecipientConfig {
  preferredNameService: string | undefined;
  setPreferredNameService(nameService: string | undefined): void;
  getNameService(type: string): NameService | undefined;
  getNameServices(): NameService[];
  // address를 반환하는 name service의 결과를 반환한다.
  // preferredNameService가 설정되어 있지 않으면 모든 name service의 결과를 반환한다.
  // preferredNameService가 설정되어 있으면 해당 name service의 결과를 반환한다.
  nameServiceResult: {
    type: string;
    address: string;
    fullName: string;
    domain: string;
    suffix: string;
  }[];
}

export interface IAmountConfig extends ITxChainSetter {
  amount: CoinPretty[];

  value: string;
  setValue(value: string): void;

  currency: ERC20Currency;
  setCurrency(currency: ERC20Currency | undefined): void;
  canUseCurrency(currency: ERC20Currency): boolean;

  // Zero means unset.
  fraction: number;
  setFraction(fraction: number): void;

  uiProperties: UIProperties;
}

export interface IGasSimulator {
  enabled: boolean;
  setEnabled(value: boolean): void;

  isSimulating: boolean;

  gasEstimate: GasEstimate | undefined;

  uiProperties: UIProperties;
}
