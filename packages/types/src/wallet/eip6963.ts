import { IEthereumProvider } from "./keplr";

export enum EIP6963EventNames {
  Announce = "eip6963:announceProvider",
  Request = "eip6963:requestProvider",
}

export type EIP6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

export type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo;
  provider: IEthereumProvider;
};
