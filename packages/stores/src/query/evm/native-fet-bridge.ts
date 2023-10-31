import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import {
  ChainGetter,
  ObservableJsonRPCQuery,
  nativeFetBridgeInterface,
} from "../../common";
import { EthBridgeStatus } from "./types";
import { BigNumber } from "@ethersproject/bignumber";
import { ObservableQueryLatestBlock } from "./block";

export class ObservableQueryByFunction extends ObservableJsonRPCQuery<string> {
  constructor(
    kvStore: KVStore,
    ethereumURL: string,
    contractAddress: string,
    protected readonly functionName: string
  ) {
    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    super(kvStore, instance, "", "eth_call", [
      {
        to: contractAddress,
        data: nativeFetBridgeInterface.encodeFunctionData(functionName),
      },
      "latest",
    ]);

    makeObservable(this);
  }

  @computed
  get data(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      return nativeFetBridgeInterface.decodeFunctionResult(
        this.functionName,
        this.response.data
      )[0];
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

export class ObservableQueryNativeFetEthBrige {
  protected readonly _querySwapMin: ObservableQueryByFunction;
  protected readonly _querySwapMax: ObservableQueryByFunction;
  protected readonly _queryPausedSince: ObservableQueryByFunction;
  protected readonly _queryPausedRelayerSince: ObservableQueryByFunction;
  protected readonly _querySupply: ObservableQueryByFunction;
  protected readonly _queryFee: ObservableQueryByFunction;
  protected readonly _queryCap: ObservableQueryByFunction;
  protected readonly _queryReverseAggLimit: ObservableQueryByFunction;
  protected readonly _queryReverseAggLimitCap: ObservableQueryByFunction;
  protected readonly _queryLatestBlock: ObservableQueryLatestBlock;
  protected readonly _nativeBridgeAddress: string;

  constructor(kvStore: KVStore, chainGetter: ChainGetter) {
    const ethereumURL = chainGetter.getChain("1").rpc;
    this._nativeBridgeAddress = "0x947872ad4d95e89E513d7202550A810aC1B626cC";

    this._querySwapMin = new ObservableQueryByFunction(
      kvStore,
      ethereumURL,
      this._nativeBridgeAddress,
      "getSwapMin"
    );
    this._querySwapMax = new ObservableQueryByFunction(
      kvStore,
      ethereumURL,
      this._nativeBridgeAddress,
      "getSwapMax"
    );
    this._queryPausedSince = new ObservableQueryByFunction(
      kvStore,
      ethereumURL,
      this._nativeBridgeAddress,
      "getPausedSinceBlockPublicApi"
    );
    this._queryPausedRelayerSince = new ObservableQueryByFunction(
      kvStore,
      ethereumURL,
      this._nativeBridgeAddress,
      "getPausedSinceBlockRelayerApi"
    );
    this._querySupply = new ObservableQueryByFunction(
      kvStore,
      ethereumURL,
      this._nativeBridgeAddress,
      "getSupply"
    );
    this._queryFee = new ObservableQueryByFunction(
      kvStore,
      ethereumURL,
      this._nativeBridgeAddress,
      "getSwapFee"
    );
    this._queryCap = new ObservableQueryByFunction(
      kvStore,
      ethereumURL,
      this._nativeBridgeAddress,
      "getCap"
    );
    this._queryReverseAggLimit = new ObservableQueryByFunction(
      kvStore,
      ethereumURL,
      this._nativeBridgeAddress,
      "getReverseAggregatedAllowance"
    );
    this._queryReverseAggLimitCap = new ObservableQueryByFunction(
      kvStore,
      ethereumURL,
      this._nativeBridgeAddress,
      "getReverseAggregatedAllowanceApproverCap"
    );
    this._queryLatestBlock = new ObservableQueryLatestBlock(
      kvStore,
      "1",
      chainGetter
    );
  }

  get nativeBridgeAddress(): string {
    return this._nativeBridgeAddress;
  }

  get swapMin(): string | undefined {
    return this._querySwapMin.data?.toString();
  }

  get swapMax(): string | undefined {
    return this._querySwapMax.data?.toString();
  }

  get pausedSince(): string | undefined {
    return this._queryPausedSince.data?.toString();
  }

  get pausedRelayerSince(): string | undefined {
    return this._queryPausedRelayerSince.data?.toString();
  }

  get supply(): string | undefined {
    return this._querySupply.data?.toString();
  }

  get cap(): string | undefined {
    return this._queryCap.data?.toString();
  }

  get reverseAggLimit(): string | undefined {
    return this._queryReverseAggLimit.data?.toString();
  }

  get fee(): string | undefined {
    return this._queryFee.data?.toString();
  }

  get reverseAggLimitCap(): string | undefined {
    return this._queryReverseAggLimitCap.data?.toString();
  }

  get latestBlock(): string | undefined {
    return this._queryLatestBlock.block?.toString();
  }

  get paused(): boolean | undefined {
    if (this.latestBlock && this.pausedRelayerSince && this.latestBlock) {
      const currentBlock = BigNumber.from(this.latestBlock);
      const isPaused = currentBlock.gte(BigNumber.from(this.pausedSince));
      const isRelayerPaused = currentBlock.gte(
        BigNumber.from(this.pausedRelayerSince)
      );

      return isPaused || isRelayerPaused;
    }
  }

  get status(): EthBridgeStatus | undefined {
    if (
      this.fee &&
      this.reverseAggLimit &&
      this.reverseAggLimitCap &&
      this.pausedSince &&
      this.pausedRelayerSince &&
      this.swapMin &&
      this.swapMax &&
      this.supply &&
      this.cap &&
      this.latestBlock
    ) {
      const currentBlock = BigNumber.from(this.latestBlock);
      const isPaused = currentBlock.gte(BigNumber.from(this.pausedSince));
      const isRelayerPaused = currentBlock.gte(
        BigNumber.from(this.pausedRelayerSince)
      );
      const paused = isPaused || isRelayerPaused;

      return {
        fee: this.fee,
        reverseAggLimit: this.reverseAggLimit,
        reverseAggLimitCap: this.reverseAggLimitCap,
        paused,
        swapMin: this.swapMin,
        swapMax: this.swapMax,
        supply: this.supply,
        cap: this.cap,
      };
    }
  }

  get isFetching() {
    return (
      this._querySwapMin.isFetching ||
      this._querySwapMax.isFetching ||
      this._queryPausedSince.isFetching ||
      this._queryPausedRelayerSince.isFetching ||
      this._querySupply.isFetching ||
      this._queryFee.isFetching ||
      this._queryCap.isFetching ||
      this._queryReverseAggLimit.isFetching ||
      this._queryReverseAggLimitCap.isFetching ||
      this._queryLatestBlock.isFetching
    );
  }

  get error() {
    return (
      this._querySwapMin.error ||
      this._querySwapMax.error ||
      this._queryPausedSince.error ||
      this._queryPausedRelayerSince.error ||
      this._querySupply.error ||
      this._queryFee.error ||
      this._queryCap.error ||
      this._queryReverseAggLimit.error ||
      this._queryReverseAggLimitCap.error ||
      this._queryLatestBlock.error
    );
  }
}
