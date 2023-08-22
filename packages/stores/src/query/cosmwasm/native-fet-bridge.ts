import { FullStateData, NativeBridgeStatus } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { computed } from "mobx";
import { ObservableCosmwasmContractChainQuery } from "./contract-query";
import { ObservableQueryRPCStatus } from "../cosmos/status";
import { BigNumber } from "@ethersproject/bignumber";

export class ObservableQueryBridgeStatus extends ObservableCosmwasmContractChainQuery<FullStateData> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    chainId: string,
    contractAddress: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, { full_state: {} });
  }

  @computed
  get data(): FullStateData | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    return this.response.data;
  }
}

export class ObservableQueryNativeFetCosmosBridge {
  protected readonly _queryRPCStatus: ObservableQueryRPCStatus;
  protected readonly _queryBridgeStatus: ObservableQueryBridgeStatus;
  protected readonly _nativeBridgeAddress: string;

  constructor(kvStore: KVStore, chainGetter: ChainGetter) {
    const chainId = "fetchhub-4";

    this._nativeBridgeAddress = "fetch1qxxlalvsdjd07p07y3rc5fu6ll8k4tmetpha8n";

    this._queryBridgeStatus = new ObservableQueryBridgeStatus(
      kvStore,
      chainGetter,
      chainId,
      this._nativeBridgeAddress
    );

    this._queryRPCStatus = new ObservableQueryRPCStatus(
      kvStore,
      chainId,
      chainGetter
    );
  }

  get nativeBridgeAddress(): string {
    return this._nativeBridgeAddress;
  }

  get status(): NativeBridgeStatus | undefined {
    if (
      !this._queryBridgeStatus.data ||
      !this._queryRPCStatus.latestBlockHeight
    ) {
      return undefined;
    }
    const pausedSince = BigNumber.from(
      this._queryBridgeStatus.data.paused_since_block_public_api.toString()
    );
    const relayerPausedSince = BigNumber.from(
      this._queryBridgeStatus.data.paused_since_block_relayer_api.toString()
    );

    const height = BigNumber.from(
      this._queryRPCStatus.latestBlockHeight.toString()
    );

    const isPaused = height.gte(pausedSince);
    const isRelayerPaused = height.gte(relayerPausedSince);

    return {
      fee: BigNumber.from(this._queryBridgeStatus.data.swap_fee).toString(),
      reverseAggLimit: BigNumber.from(
        this._queryBridgeStatus.data.reverse_aggregated_allowance
      ).toString(),
      reverseAggLimitCap: BigNumber.from(
        this._queryBridgeStatus.data.reverse_aggregated_allowance_approver_cap
      ).toString(),
      cap: BigNumber.from(this._queryBridgeStatus.data.cap).toString(),
      paused: isPaused || isRelayerPaused,
      supply: BigNumber.from(this._queryBridgeStatus.data.supply).toString(),
      swapMax: BigNumber.from(
        this._queryBridgeStatus.data.upper_swap_limit
      ).toString(),
      swapMin: BigNumber.from(
        this._queryBridgeStatus.data.lower_swap_limit
      ).toString(),
    };
  }

  get isFetching() {
    return (
      this._queryBridgeStatus.isFetching || this._queryRPCStatus.isFetching
    );
  }

  get error() {
    return this._queryBridgeStatus.error || this._queryRPCStatus.error;
  }
}
