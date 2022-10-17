import { ChainInfo } from "@keplr-wallet/types";

export type ChainInfoWithEmbed = ChainInfo & {
  embeded: boolean;
};
