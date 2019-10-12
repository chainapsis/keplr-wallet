import { ChainInfo } from "../chain";

import { sendMessage } from "../../../common/message";
import {
  GetKeyMsg,
  KeyRingStatus,
  SetPathMsg
} from "../../../background/keyring";

import { action, flow, observable } from "mobx";
import { BACKGROUND_PORT } from "../../../common/message/constant";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";

import { getAccount } from "../../utils/rest";
import { RootStore } from "../root";

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
  @action
  public setChainInfo = flow(function*(this: AccountStore, info: ChainInfo) {
    this.chainInfo = info;

    if (this.keyRingStatus === KeyRingStatus.UNLOCKED) {
      yield this.fetchAccount();
    }
  });

  // This will be called by keyring store.
  @action
  public setKeyRingStatus = flow(function*(
    this: AccountStore,
    status: KeyRingStatus
  ) {
    this.keyRingStatus = status;

    if (status === KeyRingStatus.UNLOCKED) {
      yield this.fetchAccount();
    }
  });

  @action
  public setBIP44Account = flow(function*(
    this: AccountStore,
    account: number,
    index: number
  ) {
    this.bip44Account = account;
    this.bip44Index = index;

    yield this.fetchAccount();
  });

  @action
  public fetchAccount = flow(function*(this: AccountStore) {
    yield this.fetchBech32Address();
    yield this.fetchAssets();
  });

  @action
  private fetchBech32Address = flow(function*(this: AccountStore) {
    const bip44 = this.chainInfo.bip44;
    const prefix = this.chainInfo.bech32Config.bech32PrefixAccAddr;

    this.isAddressFetching = true;

    const path = bip44.pathString(this.bip44Account, this.bip44Index);
    const setPathMsg = SetPathMsg.create(path);
    yield sendMessage(BACKGROUND_PORT, setPathMsg);

    const getKeyMsg = GetKeyMsg.create(prefix);
    const result = yield sendMessage(BACKGROUND_PORT, getKeyMsg);
    this.bech32Address = result.bech32Address as string;
    this.isAddressFetching = false;
  });

  /*
   This should be called when isAddressFetching is false.
   */
  @action
  private fetchAssets = flow(function*(this: AccountStore) {
    if (this.isAddressFetching) {
      throw new Error("Address is fetching");
    }

    this.isAssetFetching = true;

    try {
      const account = yield getAccount(
        this.chainInfo.rpc,
        this.chainInfo.bech32Config,
        this.bech32Address
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
  });
}
