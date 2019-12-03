import { ChainInfo } from "../../../../chain-info";

import { sendMessage } from "../../../../common/message";
import {
  GetKeyMsg,
  KeyRingStatus,
  SetPathMsg
} from "../../../../background/keyring";

import { action, observable } from "mobx";
import { actionAsync, task } from "mobx-utils";

import { BACKGROUND_PORT } from "../../../../common/message/constant";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";

import { queryAccount } from "@everett-protocol/cosmosjs/core/query";
import { RootStore } from "../root";
import Axios from "axios";

export class AccountStore {
  @observable
  private chainInfo!: ChainInfo;

  @observable
  public isAddressFetching!: boolean;

  @observable
  public bech32Address!: string;

  @observable
  public isAssetFetching!: boolean;

  @observable
  public assets!: Coin[];

  @observable
  public bip44Account!: number;

  @observable
  public bip44Index!: number;

  @observable
  public keyRingStatus!: KeyRingStatus;

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  constructor(private readonly rootStore: RootStore) {
    this.init();
  }

  @action
  private init() {
    this.isAddressFetching = true;
    this.bech32Address = "";

    this.isAssetFetching = true;
    this.assets = [];

    this.bip44Account = 0;
    this.bip44Index = 0;

    this.keyRingStatus = KeyRingStatus.NOTLOADED;
  }

  // This will be called by chain store.
  @actionAsync
  public async setChainInfo(info: ChainInfo) {
    this.chainInfo = info;

    if (this.keyRingStatus === KeyRingStatus.UNLOCKED) {
      await task(this.fetchAccount());
    }
  }

  // This will be called by keyring store.
  @actionAsync
  public async setKeyRingStatus(status: KeyRingStatus) {
    this.keyRingStatus = status;

    if (status === KeyRingStatus.UNLOCKED) {
      await task(this.fetchAccount());
    }
  }

  @actionAsync
  public async setBIP44Account(account: number, index: number) {
    this.bip44Account = account;
    this.bip44Index = index;

    await task(this.fetchAccount());
  }

  @actionAsync
  public async fetchAccount() {
    await task(this.fetchBech32Address());
    await task(this.fetchAssets());
  }

  @actionAsync
  private async fetchBech32Address() {
    this.isAddressFetching = true;

    const setPathMsg = SetPathMsg.create(
      this.chainInfo.chainId,
      this.bip44Account,
      this.bip44Index
    );
    await task(sendMessage(BACKGROUND_PORT, setPathMsg));

    // No need to set origin, because this is internal.
    const getKeyMsg = GetKeyMsg.create(this.chainInfo.chainId, "");
    const result = await task(sendMessage(BACKGROUND_PORT, getKeyMsg));
    this.bech32Address = result.bech32Address;
    this.isAddressFetching = false;
  }

  /*
   This should be called when isAddressFetching is false.
   */
  @actionAsync
  private async fetchAssets() {
    if (this.isAddressFetching) {
      throw new Error("Address is fetching");
    }

    this.isAssetFetching = true;

    try {
      const account = await task(
        queryAccount(
          this.chainInfo.bech32Config,
          Axios.create({ baseURL: this.chainInfo.rpc }),
          this.bech32Address
        )
      );

      this.assets = account.getCoins();
    } catch (e) {
      this.assets = [];
      if (
        !e.toString().includes(`account ${this.bech32Address} does not exist`)
      ) {
        throw e;
      }
    } finally {
      this.isAssetFetching = false;
    }
  }
}
