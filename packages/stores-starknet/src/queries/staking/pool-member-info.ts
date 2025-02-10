import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { ChainInfo } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { ObservableStarknetChainJsonRpcQuery } from "../starknet-chain-json-rpc";
import { CairoUint256 } from "starknet";

export class ObservableQueryPoolMemberInfoImpl extends ObservableStarknetChainJsonRpcQuery<
  string[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly poolAddress: string,
    protected readonly starknetHexAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "starknet_call", {
      request: {
        contract_address: poolAddress,
        calldata: [starknetHexAddress],
        // selector.getSelectorFromName("poolMemberInfo")
        entry_point_selector:
          "0x00cf37a862e5bf34bd0e858865ea02d4ba6db9cc722f3424eb452c94d4ea567f",
      },
    });

    makeObservable(this);
  }

  @computed
  get stakedAmount(): CoinPretty | undefined {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      return;
    }

    const currency = modularChainInfo.starknet.currencies[0];

    if (!this.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    /**
     * Expected response data structure:
     * [
     *    rewardAddress: ContractAddress,
     *    amount: u128,
     *    index: u128,
     *    unclaimedRewards: u128,
     *    commission: u16,
     *    unpoolAmount: u128,
     *    hasUnpoolTime: 0x01 or 0x00, (0x01 if unpoolTime is not None)
     *    unpoolTime (optional): hex unix timestamp if hasUnpoolTime is 0x01
     * ]
     *
     */
    if (this.response.data.length < 7) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    const stakedBalance = new CairoUint256({
      low: this.response.data[1], // low 128 bits as amount is u128
      high: 0,
    });

    return new CoinPretty(currency, new Int(stakedBalance.toBigInt()));
  }

  @computed
  get unclaimedRewards(): CoinPretty | undefined {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      return;
    }

    const currency = modularChainInfo.starknet.currencies[0];

    if (!this.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    if (this.response.data.length < 7) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    const unclaimedRewards = new CairoUint256({
      low: this.response.data[3], // low 128 bits as unclaimedRewards is u128
      high: 0,
    });

    return new CoinPretty(currency, new Int(unclaimedRewards.toBigInt()));
  }

  @computed
  get unpoolAmount(): CoinPretty | undefined {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      return;
    }

    const currency = modularChainInfo.starknet.currencies[0];

    if (!this.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    if (this.response.data.length < 7) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    const unpoolAmount = new CairoUint256({
      low: this.response.data[5], // low 128 bits as unpoolAmount is u128
      high: 0,
    });

    return new CoinPretty(currency, new Int(unpoolAmount.toBigInt()));
  }

  @computed
  get unpoolTime(): number | undefined {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      return;
    }

    if (!this.response || !this.response.data) {
      return;
    }

    if (this.response.data.length < 7) {
      return;
    }

    if (this.response.data[6] === "0x01") {
      return parseInt(this.response.data[7], 16);
    }

    return undefined;
  }

  @computed
  get commission(): number | undefined {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      return;
    }

    if (!this.response || !this.response.data) {
      return;
    }

    if (this.response.data.length < 7) {
      return;
    }

    return parseInt(this.response.data[4], 16) / 100;
  }
}

export class ObservableQueryPoolMemberInfo {
  protected map: Map<string, ObservableQueryPoolMemberInfoImpl> = new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getPoolMemberInfo(
    chainId: string,
    chainGetter: ChainGetter<ChainInfo>,
    poolAddress: string,
    starknetHexAddress: string
  ): ObservableQueryPoolMemberInfoImpl | undefined {
    const key = `${chainId}/${poolAddress}/${starknetHexAddress}`;
    const prior = this.map.get(key);
    if (prior) {
      return prior;
    }

    const modularChainInfo = chainGetter.getModularChain(chainId);
    if (!("starknet" in modularChainInfo)) {
      return;
    }

    const impl = new ObservableQueryPoolMemberInfoImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      poolAddress,
      starknetHexAddress
    );
    this.map.set(key, impl);
    return impl;
  }
}
