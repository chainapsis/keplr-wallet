import { observable, action, computed } from "mobx";
import { KeyRing } from "../keyring";
import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";

export interface ChainInfo {
  readonly chainId: string;
  readonly chainName: string;
  readonly coinDenom: string;
  readonly coinMinimalDenom: string;
  readonly coinDecimals: number;
  readonly bip44: BIP44;
  readonly bech32AddrPrefix: string;
}

export class ChainStore {
  @observable public chainList!: ChainInfo[];

  @observable
  public chainInfo!: ChainInfo;

  constructor(private keyRing: KeyRing) {
    this.setChainList([
      {
        chainId: "cosmoshub-2",
        chainName: "Cosmos",
        coinDenom: "ATOM",
        coinMinimalDenom: "uATOM",
        coinDecimals: 6,
        bip44: new BIP44(44, 118, 0),
        bech32AddrPrefix: "cosmos"
      },
      {
        chainId: "columbus-2",
        chainName: "Terra",
        coinDenom: "LUNA",
        coinMinimalDenom: "uLUNA",
        coinDecimals: 6,
        bip44: new BIP44(44, 330, 0),
        bech32AddrPrefix: "terra"
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
  }

  @action
  public setChainList(chainList: ChainInfo[]) {
    this.chainList = chainList;
  }

  @computed
  public get bech32Address(): string {
    return this.keyRing.bech32Address(
      this.chainInfo.bip44,
      this.chainInfo.bech32AddrPrefix
    );
  }
}
