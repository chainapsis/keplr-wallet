import { AminoSignResponse, StdSignDoc } from "@keplr-wallet/types";

export interface KeplrCoreTypes {
  __core__getAnalyticsId(): Promise<string>;
  __core__privilageSignAminoWithdrawRewards(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse>;
}
