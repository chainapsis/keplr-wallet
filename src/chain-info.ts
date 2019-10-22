import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";
import {
  Bech32Config,
  defaultBech32Config
} from "@everett-protocol/cosmosjs/core/bech32Config";

export interface ChainInfo {
  readonly rpc: string;
  readonly chainId: string;
  readonly chainName: string;
  readonly coinDenom: string;
  readonly coinMinimalDenom: string;
  readonly coinDecimals: number;
  readonly coinIconUrl: string;
  readonly walletUrl: string;
  readonly bip44: BIP44;
  readonly bech32Config: Bech32Config;
}

export const NativeChainInfos: ChainInfo[] = [
  {
    rpc: "http://localhost",
    chainId: "cosmoshub-2",
    chainName: "Cosmos",
    coinDenom: "ATOM",
    coinMinimalDenom: "uATOM",
    coinDecimals: 6,
    coinIconUrl: require("assets/atom-icon.png"),
    walletUrl:
      process.env.NODE_ENV === "production"
        ? ""
        : "http://localhost:8081/#/cosmoshub-2",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos")
  },
  {
    rpc: "null",
    chainId: "columbus-2",
    chainName: "Terra",
    coinDenom: "LUNA",
    coinMinimalDenom: "uLUNA",
    coinDecimals: 6,
    coinIconUrl: require("assets/luna-icon.svg"),
    walletUrl:
      process.env.NODE_ENV === "production"
        ? ""
        : "http://localhost:8081/#/columbus-2",
    bip44: new BIP44(44, 330, 0),
    bech32Config: defaultBech32Config("terra")
  }
];
