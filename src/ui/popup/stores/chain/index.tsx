import { observable, action, flow } from "mobx";

import { RootStore } from "../root";

import { ChainInfo, NativeChainInfos } from "../../../../chain-info";
import {
  SetPersistentMemoryMsg,
  GetPersistentMemoryMsg
} from "../../../../background/persistent-memory";
import { GetRegisteredChainMsg } from "../../../../background/keyring";
import { sendMessage } from "../../../../common/message";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class ChainStore {
  @observable public chainList!: ChainInfo[];

  @observable
  public chainInfo!: ChainInfo;

  constructor(private rootStore: RootStore) {
    this.setChainList(NativeChainInfos);

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
    // If no match chain id, throw error.
    if (chainInfo === null) {
      throw new Error("Invalid chain id");
    }

    this.chainInfo = chainInfo;

    this.rootStore.keyRingStore.setChainInfo(chainInfo);
    this.rootStore.accountStore.setChainInfo(chainInfo);
  }

  @action
  public saveLastViewChainId = flow(function*(this: ChainStore) {
    // Save last view chain id to persistent background
    const msg = SetPersistentMemoryMsg.create({
      lastViewChainId: this.chainInfo.chainId
    });
    yield sendMessage(BACKGROUND_PORT, msg);
  });

  @action
  public init = flow(function*(this: ChainStore) {
    yield this.getChainInfosFromBackground();

    // Get last view chain id to persistent background
    const msg = GetPersistentMemoryMsg.create();
    const result = yield sendMessage(BACKGROUND_PORT, msg);
    if (result && result.lastViewChainId) {
      this.setChain(result.lastViewChainId);
    }
  });

  @action
  private getChainInfosFromBackground = flow(function*(this: ChainStore) {
    const msg = GetRegisteredChainMsg.create();
    const result = yield sendMessage(BACKGROUND_PORT, msg);
    const chainInfos: ChainInfo[] = result.chainInfos.map(
      (chainInfo: Writeable<ChainInfo>) => {
        chainInfo.bip44 = Object.setPrototypeOf(
          chainInfo.bip44,
          BIP44.prototype
        );
        return chainInfo;
      }
    );
    this.setChainList(chainInfos);
  });

  @action
  public setChainList(chainList: ChainInfo[]) {
    this.chainList = chainList;
  }
}
