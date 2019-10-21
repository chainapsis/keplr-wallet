import { observable, action } from "mobx";

import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";
import {
  Bech32Config,
  defaultBech32Config
} from "@everett-protocol/cosmosjs/core/bech32Config";
import { RootStore } from "../root";

export interface ChainInfo {
  readonly rpc: string;
  readonly chainId: string;
  readonly chainName: string;
  readonly coinDenom: string;
  readonly coinMinimalDenom: string;
  readonly coinDecimals: number;
  readonly bip44: BIP44;
  readonly bech32Config: Bech32Config;
}

export class ChainStore {
  @observable public chainList!: ChainInfo[];

  @observable
  public chainInfo!: ChainInfo;

  constructor(private rootStore: RootStore) {
    this.setChainList([
      {
        rpc: "http://localhost",
        chainId: "cosmoshub-2",
        chainName: "Cosmos",
        coinDenom: "ATOM",
        coinMinimalDenom: "uATOM",
        coinDecimals: 6,
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
        bip44: new BIP44(44, 330, 0),
        bech32Config: defaultBech32Config("terra")
      }
    ]);

    this.setChain(this.chainList[0].chainId);
  }

  @action
  public setChain(chainId: string) {
    let chainInfo: ChainInfo | null = null;
    for (const ci of this.chainList) {
      if (ci.chainId === chainId) {
        chainInfo = ci;
      }
    }
    if (chainInfo === null) {
      chainInfo = this.chainList[0];
    }

    this.chainInfo = chainInfo;

    this.rootStore.keyRingStore.setChainInfo(chainInfo);
    this.rootStore.accountStore.setChainInfo(chainInfo);
  }

  @action
  public setChainList(chainList: ChainInfo[]) {
    this.chainList = chainList;
  }
}
