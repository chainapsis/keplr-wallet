import { ChainInfo } from "@keplr-wallet/types";

export type ChainInfoWithRepoUpdateOptions = ChainInfo & {
  updateFromRepoDisabled?: boolean;
};

export type ChainInfoWithCoreTypes = ChainInfo & {
  embedded: boolean;
} & ChainInfoWithRepoUpdateOptions;
