import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { computed, makeObservable, observable } from "mobx";
import {
  ObservableStarknetChainJsonRpcQuery,
  ObservableStarknetChainJsonRpcQueryMap,
} from "../starknet-chain-json-rpc";
import { CairoUint256 } from "starknet";
import { ClaimableReward, StarknetValidator, UnpoolDelegation } from "./types";
import { computedFn } from "mobx-utils";

export class ObservableQueryPoolMemberInfo extends ObservableStarknetChainJsonRpcQuery<
  string[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    poolAddress: string,
    starknetHexAddress: string
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

    const currency = modularChainInfo.starknet.currencies.find(
      (c) => c.coinDenom === "STRK"
    );

    if (!currency) {
      return;
    }

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
     *    hasUnpoolTime: 0x1 or 0x0, (0x1 if unpoolTime is not None)
     *    unpoolTime (optional): hex unix timestamp if hasUnpoolTime is 0x1
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

    const currency = modularChainInfo.starknet.currencies.find(
      (c) => c.coinDenom === "STRK"
    );

    if (!currency) {
      return;
    }

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

    const currency = modularChainInfo.starknet.currencies.find(
      (c) => c.coinDenom === "STRK"
    );

    if (!currency) {
      return;
    }

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

    if (this.response.data[6] === "0x0") {
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

export class ObservableQueryPoolMemberInfoMap extends ObservableStarknetChainJsonRpcQueryMap<
  string[]
> {
  protected starknetHexAddress: string;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    starknetHexAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, (poolAddress: string) => {
      return new ObservableQueryPoolMemberInfo(
        sharedContext,
        chainId,
        chainGetter,
        poolAddress,
        starknetHexAddress
      );
    });
    makeObservable(this);

    this.starknetHexAddress = starknetHexAddress;
  }

  getQueryPoolAddress = computedFn((poolAddress: string) => {
    return this.get(poolAddress) as ObservableQueryPoolMemberInfo;
  });

  getQueryStakingInfo = computedFn((validators: StarknetValidator[]) => {
    return new ObservableQueryStakingInfo(this, validators);
  });

  getStakingCurrency = () => {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      return;
    }

    return modularChainInfo.starknet.currencies.find(
      (c) => c.coinDenom === "STRK"
    );
  };
}

export class ObservableQueryStakingInfo {
  @observable.shallow
  protected map: ObservableQueryPoolMemberInfoMap;

  @observable.shallow
  protected validators: StarknetValidator[];

  constructor(
    map: ObservableQueryPoolMemberInfoMap,
    validators: StarknetValidator[]
  ) {
    makeObservable(this);

    this.map = map;
    this.validators = validators;
  }

  @computed
  get totalStakedAmount(): CoinPretty | undefined {
    const currency = this.map.getStakingCurrency();
    if (!currency) {
      return;
    }

    let totalStakedAmount = new CoinPretty(currency, new Int(0));

    for (const validator of this.validators) {
      const queryPoolMemberInfo = this.map.getQueryPoolAddress(
        validator.pool_contract_address
      );

      if (!queryPoolMemberInfo) {
        continue;
      }

      const stakedAmount = queryPoolMemberInfo.stakedAmount;

      if (!stakedAmount) {
        continue;
      }

      totalStakedAmount = totalStakedAmount.add(stakedAmount);
    }

    return totalStakedAmount;
  }

  @computed
  get totalClaimableRewardAmount(): CoinPretty | undefined {
    const currency = this.map.getStakingCurrency();
    if (!currency) {
      return;
    }

    let amount = new CoinPretty(currency, new Int(0));

    for (const validator of this.validators) {
      const queryPoolMemberInfo = this.map.getQueryPoolAddress(
        validator.pool_contract_address
      );

      if (!queryPoolMemberInfo) {
        continue;
      }

      const unclaimedRewards = queryPoolMemberInfo.unclaimedRewards;
      if (!unclaimedRewards) {
        continue;
      }

      amount = amount.add(unclaimedRewards);
    }

    return amount;
  }

  @computed
  get claimableRewards():
    | {
        claimableRewards: ClaimableReward[];
        totalClaimableRewardAmount: CoinPretty;
      }
    | undefined {
    const currency = this.map.getStakingCurrency();
    if (!currency) {
      return;
    }

    const claimableRewards = [];
    let amount = new CoinPretty(currency, new Int(0));

    for (const validator of this.validators) {
      const queryPoolMemberInfo = this.map.getQueryPoolAddress(
        validator.pool_contract_address
      );

      if (!queryPoolMemberInfo) {
        continue;
      }

      const unclaimedRewards = queryPoolMemberInfo.unclaimedRewards;
      if (!unclaimedRewards) {
        continue;
      }

      if (unclaimedRewards.toDec().gt(new Dec(0))) {
        claimableRewards.push({
          validatorAddress: validator.operational_address,
          poolAddress: validator.pool_contract_address,
          rewardAddress: validator.reward_address,
          amount: unclaimedRewards,
        });

        amount = amount.add(unclaimedRewards);
      }
    }

    return {
      claimableRewards,
      totalClaimableRewardAmount: amount,
    };
  }

  @computed
  get unbondings():
    | {
        unbondings: UnpoolDelegation[];
        totalUnbondingAmount: CoinPretty;
      }
    | undefined {
    const currency = this.map.getStakingCurrency();
    if (!currency) {
      return;
    }

    const unbondings = [];
    let amount = new CoinPretty(currency, new Int(0));

    for (const validator of this.validators) {
      const queryPoolMemberInfo = this.map.getQueryPoolAddress(
        validator.pool_contract_address
      );

      if (!queryPoolMemberInfo) {
        continue;
      }

      const unpoolTime = queryPoolMemberInfo.unpoolTime;
      const unpoolAmount = queryPoolMemberInfo.unpoolAmount;

      if (
        !unpoolTime ||
        !unpoolAmount ||
        unpoolAmount.toDec().lte(new Dec(0)) ||
        unpoolTime < Date.now() / 1000
      ) {
        continue;
      }

      unbondings.push({
        validatorAddress: validator.operational_address,
        poolAddress: validator.pool_contract_address,
        rewardAddress: validator.reward_address,
        amount: unpoolAmount,
        period: unpoolTime,
      });

      amount = amount.add(unpoolAmount);
    }

    return {
      unbondings,
      totalUnbondingAmount: amount,
    };
  }
}
