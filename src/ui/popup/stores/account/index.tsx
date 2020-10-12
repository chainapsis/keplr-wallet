import { ChainInfo } from "../../../../background/chains";

import { sendMessage } from "../../../../common/message";
import { GetKeyMsg, KeyRingStatus } from "../../../../background/keyring";

import { action, observable } from "mobx";
import { actionAsync, task } from "mobx-utils";

import { BACKGROUND_PORT } from "../../../../common/message/constant";
import { Coin } from "@chainapsis/cosmosjs/common/coin";

import { queryAccount } from "@chainapsis/cosmosjs/core/query";
import { RootStore } from "../root";

import Axios, { CancelTokenSource } from "axios";
import { AutoFetchingAssetsInterval } from "../../../../config";
import { Int } from "@chainapsis/cosmosjs/common/int";

type RestResult<Result> = {
  height: string;
  result: Result;
};

type ResultDelegations = [
  {
    delegator_address: string;
    validator_address: string;
    shares: string;
    balance:
      | {
          denom: string;
          amount: string;
        }
      | string;
  }
];

type ResultUnbondings = [
  {
    delegator_address: string;
    validator_address: string;
    entries: [
      {
        initial_balance: string;
        balance:
          | {
              denom: string;
              amount: string;
            }
          | string;
      }
    ];
  }
];

type ResultRedelegations = [
  {
    delegator_address: string;
    validator_src_address: string;
    validator_dst_address: string;
    entries: [
      {
        initial_balance: string;
        balance:
          | {
              denom: string;
              amount: string;
            }
          | string;
      }
    ];
  }
];

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
  public lastAssetFetchingError: Error | undefined;

  // Assets that exist on the chain itself.
  @observable
  public assets!: Coin[];

  // Asset that is staked or being unbonded or being redelegated.
  @observable
  public stakedAsset: Coin | undefined;

  @observable
  public keyRingStatus!: KeyRingStatus;

  // Not need to be observable
  private lastFetchingCancleToken!: CancelTokenSource | undefined;
  // Account store fetchs the assets that the account has for chain by interval.
  // If chain is changed, abort last interval and restart fetching by interval.
  private lastFetchingIntervalId!: NodeJS.Timeout | undefined;

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

    this.keyRingStatus = KeyRingStatus.NOTLOADED;
  }

  // This will be called by chain store.
  @actionAsync
  public async setChainInfo(info: ChainInfo) {
    this.chainInfo = info;

    if (this.keyRingStatus === KeyRingStatus.UNLOCKED) {
      await task(this.fetchAccount());

      this.fetchAssetsByInterval();
    }
  }

  private fetchAssetsByInterval() {
    if (this.lastFetchingIntervalId) {
      clearInterval(this.lastFetchingIntervalId);
      this.lastFetchingIntervalId = undefined;
    }

    // Fetch the assets by interval.
    this.lastFetchingIntervalId = setInterval(() => {
      this.fetchAssets(false);
    }, AutoFetchingAssetsInterval);
  }

  @actionAsync
  public async changeKeyRing() {
    if (this.keyRingStatus === KeyRingStatus.UNLOCKED) {
      await task(this.fetchAccount());

      this.fetchAssetsByInterval();
    }
  }

  // This will be called by keyring store.
  @actionAsync
  public async setKeyRingStatus(status: KeyRingStatus) {
    this.keyRingStatus = status;

    if (status === KeyRingStatus.UNLOCKED) {
      await task(this.fetchAccount());

      this.fetchAssetsByInterval();
    }
  }

  @actionAsync
  public async fetchAccount() {
    await task(this.fetchBech32Address());
    await task(this.fetchAssets());
  }

  @actionAsync
  private async fetchBech32Address() {
    this.isAddressFetching = true;

    const getKeyMsg = new GetKeyMsg(this.chainInfo.chainId);
    const result = await task(sendMessage(BACKGROUND_PORT, getKeyMsg));

    const prevBech32Address = this.bech32Address;

    this.bech32Address = result.bech32Address;
    this.isAddressFetching = false;

    if (prevBech32Address !== this.bech32Address) {
      // If bech32address is changed.
      // Cancle last fetching, and clear the account's assets.
      if (this.lastFetchingCancleToken) {
        this.lastFetchingCancleToken.cancel();
        this.lastFetchingCancleToken = undefined;
      }

      this.lastAssetFetchingError = undefined;
      // Load the assets from storage.
      this.assets = await task(
        this.loadAssetsFromStorage(this.chainInfo.chainId, this.bech32Address)
      );
      // Load the staked assets from storage.
      const stakedAsset = await task(
        this.loadAssetsFromStorage(
          this.chainInfo.chainId,
          this.bech32Address,
          true
        )
      );
      if (stakedAsset.length > 0) {
        this.stakedAsset = stakedAsset[0];
      }
    }
  }

  /*
   This should be called when isAddressFetching is false.
   */
  @actionAsync
  private async fetchAssets(fetchStakedAsset: boolean = true) {
    if (this.isAddressFetching) {
      throw new Error("Address is fetching");
    }

    // If bech32 address is not matched, don't need to fetch assets because it always fails.
    if (
      !this.bech32Address.startsWith(
        this.chainInfo.bech32Config.bech32PrefixAccAddr
      )
    ) {
      return;
    }

    // If fetching is in progess, abort it.
    if (this.lastFetchingCancleToken) {
      this.lastFetchingCancleToken.cancel();
      this.lastFetchingCancleToken = undefined;
    }
    this.lastFetchingCancleToken = Axios.CancelToken.source();

    this.isAssetFetching = true;

    try {
      const account = await task(
        queryAccount(
          Axios.create({
            ...this.chainInfo.rpcConfig,
            ...{
              baseURL: this.chainInfo.rpc,
              cancelToken: this.lastFetchingCancleToken.token
            }
          }),
          this.bech32Address,
          this.chainInfo.bech32Config.bech32PrefixAccAddr
        )
      );

      this.assets = account.getCoins();
      this.lastAssetFetchingError = undefined;
      // Save the assets to storage.
      await task(
        this.saveAssetsToStorage(
          this.chainInfo.chainId,
          this.bech32Address,
          this.assets
        )
      );

      if (fetchStakedAsset) {
        const restInstance = Axios.create({
          ...this.chainInfo.restConfig,
          ...{
            baseURL: this.chainInfo.rest,
            cancelToken: this.lastFetchingCancleToken?.token
          }
        });

        const staked: Coin = new Coin(
          this.chainInfo.stakeCurrency.coinMinimalDenom,
          0
        );

        const delegations = await task(
          restInstance.get<RestResult<ResultDelegations>>(
            `/staking/delegators/${this.bech32Address}/delegations`
          )
        );
        if (delegations.status === 200) {
          for (const delegation of delegations.data.result ?? []) {
            staked.amount = staked.amount.add(
              new Int(
                typeof delegation.balance === "string"
                  ? delegation.balance
                  : delegation.balance.amount
              )
            );
          }
        }

        const unbondings = await task(
          restInstance.get<RestResult<ResultUnbondings>>(
            `/staking/delegators/${this.bech32Address}/unbonding_delegations`
          )
        );
        if (unbondings.status === 200) {
          for (const unbonding of unbondings.data.result ?? []) {
            for (const entry of unbonding.entries ?? []) {
              staked.amount = staked.amount.add(
                new Int(
                  typeof entry.balance === "string"
                    ? entry.balance
                    : entry.balance.amount
                )
              );
            }
          }
        }

        // Why only this query uses the params?
        const redelegations = await task(
          restInstance.get<RestResult<ResultRedelegations>>(
            `/staking/redelegations?delegator=${this.bech32Address}`
          )
        );
        if (redelegations.status === 200) {
          for (const redelegation of redelegations.data.result ?? []) {
            for (const entry of redelegation.entries ?? []) {
              staked.amount = staked.amount.add(
                new Int(
                  typeof entry.balance === "string"
                    ? entry.balance
                    : entry.balance.amount
                )
              );
            }
          }
        }

        this.stakedAsset = staked;

        await task(
          this.saveAssetsToStorage(
            this.chainInfo.chainId,
            this.bech32Address,
            [staked],
            true
          )
        );
      }
    } catch (e) {
      if (!Axios.isCancel(e)) {
        if (
          !e.toString().includes(`account ${this.bech32Address} does not exist`)
        ) {
          this.lastAssetFetchingError = e;
        } else {
          // If account doesn't exist
          this.assets = [];
          this.stakedAsset = undefined;
        }
        // Though error occurs, don't clear last fetched assets.
        // Show last fetched assets with warning that error occured.
        console.log(`Error occurs during fetching assets: ${e.toString()}`);
      }
    } finally {
      this.lastFetchingCancleToken = undefined;
      this.isAssetFetching = false;
    }
  }

  // Not action
  private async saveAssetsToStorage(
    chainId: string,
    bech32Address: string,
    assets: Coin[],
    staked: boolean = false
  ): Promise<void> {
    const coinStrs: string[] = [];
    for (const coin of assets) {
      coinStrs.push(coin.toString());
    }

    const store = (await browser.storage.local.get()).assets ?? {};

    await browser.storage.local.set({
      assets: Object.assign({}, store, {
        [`${chainId}-${bech32Address}${
          staked ? "-staked" : ""
        }`]: coinStrs.join(",")
      })
    });
  }

  // Not action
  private async loadAssetsFromStorage(
    chainId: string,
    bech32Address: string,
    staked: boolean = false
  ): Promise<Coin[]> {
    const items = await browser.storage.local.get();

    const coins: Coin[] = [];
    const assets = items?.assets;
    if (assets) {
      const coinsStr =
        assets[`${chainId}-${bech32Address}${staked ? "-staked" : ""}`];
      if (coinsStr) {
        const coinStrs = coinsStr.split(",");
        for (const coinStr of coinStrs) {
          coins.push(Coin.parse(coinStr));
        }
      }
    }

    return coins;
  }
}
