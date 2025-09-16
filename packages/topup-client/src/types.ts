export interface TopUpPayload {
  chainId: string;
  senderAddress: string;
  rawTx: string;
}

export interface TopUpResponse {
  ok: true;
  txHash: string;
}

export interface TopUpError {
  ok: false;
  error: string;
  code: string;
  retryable: boolean;
}

export type TopUpResult = TopUpResponse | TopUpError;

// TODO: Remove
export const SUPPORTED_TOPUP_CHAINS = [
  "osmosis-1",
  "osmo-test-5",
  "cosmoshub-4",
] as const;

export type SupportedTopUpChain = (typeof SUPPORTED_TOPUP_CHAINS)[number];
