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
import { CW20Currency } from "../../../../common/currency";

const Buffer = require("buffer/").Buffer;

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

  // Not need to be observable
  private lastFetchingTokenCancleToken!: CancelTokenSource | undefined;

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
      this.fetchAssets(false).then(canceled => {
        if (!canceled) {
          this.fetchTokensSequently();
        }
      });
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
    const cancelded = await task(this.fetchAssets());
    if (!cancelded) {
      await task(this.fetchTokensSequently());
    }
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
      } else {
        this.stakedAsset = undefined;
      }
    }
  }

  /*
   This should be called when isAddressFetching is false.
   If this is canceled, return true.
   */
  @actionAsync
  private async fetchAssets(
    fetchStakedAsset: boolean = true
  ): Promise<boolean> {
    if (this.isAddressFetching) {
      throw new Error("Address is fetching");
    }

    // If bech32 address is not matched, don't need to fetch assets because it always fails.
    if (
      !this.bech32Address.startsWith(
        this.chainInfo.bech32Config.bech32PrefixAccAddr
      )
    ) {
      return true;
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

      this.pushAssets(account.getCoins());
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
          for (const currency of this.chainInfo.currencies) {
            // Remove all the native coin/tokens.
            if (!("type" in currency)) {
              this.removeAsset(currency.coinMinimalDenom);
            }
          }
          this.stakedAsset = undefined;
          // Token based on the contract can exist even if the account doesn't exist on the chain.
          // So, don't handle this case as canceled.
          // return true;
        }
        // Though error occurs, don't clear last fetched assets.
        // Show last fetched assets with warning that error occured.
        console.log(`Error occurs during fetching assets: ${e.toString()}`);
      } else {
        return true;
      }
    } finally {
      this.lastFetchingCancleToken = undefined;
      this.isAssetFetching = false;
    }

    return false;
  }

  @actionAsync
  private async fetchTokensSequently() {
    for (const currency of this.chainInfo.currencies) {
      if ("type" in currency) {
        switch (currency.type) {
          case "cw20":
            await task(this.fetchCW20Token(currency));
            break;
        }
      }
    }
  }

  @actionAsync
  private async fetchCW20Token(currency: CW20Currency) {
    // If fetching is in progess, abort it.
    if (this.lastFetchingTokenCancleToken) {
      this.lastFetchingTokenCancleToken.cancel();
      this.lastFetchingTokenCancleToken = undefined;
    }
    this.lastFetchingTokenCancleToken = Axios.CancelToken.source();

    const restInstance = Axios.create({
      ...this.chainInfo.restConfig,
      ...{
        baseURL: this.chainInfo.rest,
        cancelToken: this.lastFetchingTokenCancleToken?.token
      }
    });

    try {
      const result = await task(
        restInstance.get<{
          height: string;
          result: {
            smart: string;
          };
        }>(
          `/wasm/contract/${currency.contractAddress}/smart/${Buffer.from(
            JSON.stringify({
              balance: { address: this.bech32Address }
            })
          ).toString("hex")}?encoding=hex`
        )
      );

      if (result.status === 200) {
        const obj = JSON.parse(
          Buffer.from(result.data.result.smart, "base64").toString()
        );
        const balance = obj.balance;
        const asset = new Coin(currency.coinMinimalDenom, new Int(balance));

        this.pushAsset(asset);
        // Save the assets to storage.
        await task(
          this.saveAssetsToStorage(
            this.chainInfo.chainId,
            this.bech32Address,
            this.assets
          )
        );
      }
    } catch (e) {
      if (!Axios.isCancel(e)) {
        // TODO: Make the way to handle error.
        console.log(e);
      }
    }
  }

  @action
  private pushAsset(asset: Coin) {
    const index = this.assets.findIndex(a => {
      return a.denom === asset.denom;
    });

    if (index >= 0) {
      const assets = this.assets.slice();
      this.assets = [
        ...assets.slice(0, index),
        asset,
        ...assets.slice(index + 1)
      ];
    } else {
      this.assets.push(asset);
    }
  }

  @action
  private pushAssets(assets: Coin[]) {
    for (const asset of assets) {
      this.pushAsset(asset);
    }
  }

  @action
  private removeAsset(denom: string) {
    const index = this.assets.findIndex(a => {
      return a.denom === denom;
    });

    if (index >= 0) {
      const assets = this.assets.slice();
      this.assets = [...assets.slice(0, index), ...assets.slice(index + 1)];
    }
  }

  // Not action
  private async saveAssetsToStorage(
    chainId: string,
    bech32Address: string,
    assets: Coin[],
    staked: boolean = false
  ): Promise<void> {
    const json: {
      denom: string;
      amount: string;
    }[] = [];
    for (const asset of assets) {
      json.push({
        denom: asset.denom,
        amount: asset.amount.toString()
      });
    }

    const store = (await browser.storage.local.get()).assetsJson ?? {};

    await browser.storage.local.set({
      assetsJson: Object.assign({}, store, {
        [`${chainId}-${bech32Address}${staked ? "-staked" : ""}`]: json
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
    const assetsJson = items?.assetsJson;
    if (assetsJson) {
      const json: {
        denom: string;
        amount: string;
      }[] = assetsJson[`${chainId}-${bech32Address}${staked ? "-staked" : ""}`];

      if (json) {
        for (const c of json) {
          const coin = new Coin(c.denom, c.amount);
          coins.push(coin);
        }
      }
    }

    return coins;
  }
}
