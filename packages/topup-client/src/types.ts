import type { StdFee } from "@keplr-wallet/types";

export type TopUpRequestBody = {
  chainId: string;
  recipientAddress: string;
  fee: Omit<StdFee, "gas">;
};

export type ErrorResponseBody = {
  error: string;
};

export type TopUpResponseBody =
  | {
      txHash: string;
    }
  | ErrorResponseBody;
