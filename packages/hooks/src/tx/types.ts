import { AppCurrency, FeeCurrency, StdFee } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { NameService } from "./name-service";
import { IChainInfoImpl } from "@keplr-wallet/stores";

export interface ITxChainSetter {
  chainId: string;
  chainInfo: IChainInfoImpl;
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

export interface IMemoConfig extends ITxChainSetter {
  value: string;
  setValue(value: string): void;

  memo: string;

  uiProperties: UIProperties;
}

export interface IGasConfig extends ITxChainSetter {
  value: string;
  setValue(value: string | number): void;

  gas: number;

  uiProperties: UIProperties;
}

export interface ISenderConfig extends ITxChainSetter {
  value: string;
  setValue(value: string): void;

  sender: string;

  uiProperties: UIProperties;
}

export interface IFeeConfig extends ITxChainSetter {
  type: FeeType | "manual";

  setFee(
    fee:
      | {
          type: FeeType;
          currency: FeeCurrency;
        }
      | CoinPretty
      | CoinPretty[]
      | undefined
  ): void;

  selectableFeeCurrencies: FeeCurrency[];

  toStdFee(): StdFee;
  fees: CoinPretty[];

  getFeeTypePrettyForFeeCurrency(
    currency: FeeCurrency,
    feeType: FeeType
  ): CoinPretty;

  l1DataFee: Dec | undefined;
  setL1DataFee(fee: Dec): void;

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

export interface IBaseAmountConfig extends ITxChainSetter {
  amount: CoinPretty[];

  uiProperties: UIProperties;
}

export interface IAmountConfig extends IBaseAmountConfig {
  value: string;
  setValue(value: string): void;

  currency: AppCurrency;
  setCurrency(currency: AppCurrency | undefined): void;
  canUseCurrency(currency: AppCurrency): boolean;

  // Zero means unset.
  fraction: number;
  setFraction(fraction: number): void;
}

export const DefaultGasPriceStep: {
  low: number;
  average: number;
  high: number;
} = {
  low: 0.01,
  average: 0.025,
  high: 0.04,
};

export type FeeType = "high" | "average" | "low";

export interface IGasSimulator {
  enabled: boolean;
  setEnabled(value: boolean): void;

  isSimulating: boolean;

  gasEstimated: number | undefined;
  gasAdjustment: number;

  gasAdjustmentValue: string;
  setGasAdjustmentValue(gasAdjustment: string | number): void;

  uiProperties: UIProperties;
}
