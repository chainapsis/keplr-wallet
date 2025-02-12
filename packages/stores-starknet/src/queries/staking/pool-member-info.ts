import {
  ChainGetter,
  QueryError,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { computed, makeObservable, observable, runInAction } from "mobx";
import {
  ObservableStarknetChainJsonRpcQuery,
  ObservableStarknetChainJsonRpcQueryMap,
} from "../starknet-chain-json-rpc";
import { ObservableQueryValidators } from "./validators";
import { CairoUint256 } from "starknet";
import { ClaimableReward, UnpoolDelegation } from "./types";
import { computedFn } from "mobx-utils";
import { ERC20Currency } from "@keplr-wallet/types";

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

export class ObservableQueryStakingInfo extends ObservableStarknetChainJsonRpcQueryMap<
  string[]
> {
  protected starknetHexAddress: string;

  @observable.shallow
  protected queryValidators: ObservableQueryValidators;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    starknetHexAddress: string,
    queryValidators: ObservableQueryValidators
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
    this.queryValidators = queryValidators;
  }

  get isFetching(): boolean {
    if (this.queryValidators.isFetching) {
      return true;
    }

    const validators = this.queryValidators.validators;
    if (validators.length === 0) {
      return false;
    }

    return (
      validators.some((validator) => {
        const queryPoolMemberInfo = this.getQueryPoolAddress(
          validator.pool_contract_address
        );

        return queryPoolMemberInfo?.isFetching;
      }) ?? false
    );
  }

  get error(): QueryError<any> | undefined {
    if (this.queryValidators.error) {
      return this.queryValidators.error;
    }

    return undefined; // ignore error from queryPoolMemberInfo (not critical)
  }

  getQueryPoolAddress = computedFn((poolAddress: string) => {
    return this.get(poolAddress) as ObservableQueryPoolMemberInfo;
  });

  get totalStakedAmount(): CoinPretty | undefined {
    const stakingCurrency = this.stakingCurrency;
    if (!stakingCurrency) {
      return;
    }

    let totalStakedAmount = new CoinPretty(stakingCurrency, new Int(0));

    const validators = this.queryValidators.validators;

    for (const validator of validators) {
      const queryPoolMemberInfo = this.getQueryPoolAddress(
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
    const stakingCurrency = this.stakingCurrency;
    if (!stakingCurrency) {
      return;
    }

    let amount = new CoinPretty(stakingCurrency, new Int(0));

    const validators = this.queryValidators.validators;

    for (const validator of validators) {
      const queryPoolMemberInfo = this.getQueryPoolAddress(
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
  get claimableRewards():
    | {
        claimableRewards: ClaimableReward[];
        totalClaimableRewardAmount: CoinPretty;
      }
    | undefined {
    const stakingCurrency = this.stakingCurrency;
    if (!stakingCurrency) {
      return;
    }

    const claimableRewards = [];
    let amount = new CoinPretty(stakingCurrency, new Int(0));

    const validators = this.queryValidators.validators;
    if (validators.length === 0) {
      return;
    }

    for (const validator of validators) {
      const queryPoolMemberInfo = this.getQueryPoolAddress(
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
    const stakingCurrency = this.stakingCurrency;
    if (!stakingCurrency) {
      return;
    }

    const unbondings = [];
    let amount = new CoinPretty(stakingCurrency, new Int(0));

    const validators = this.queryValidators.validators;
    if (validators.length === 0) {
      return;
    }

    for (const validator of validators) {
      const queryPoolMemberInfo = this.getQueryPoolAddress(
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
        completeTime: unpoolTime,
      });

      amount = amount.add(unpoolAmount);
    }

    return {
      unbondings,
      totalUnbondingAmount: amount,
    };
  }

  readonly getDescendingPendingClaimableRewards = computedFn(
    (maxValiadtors: number): ClaimableReward[] => {
      const rewards = this.claimableRewards;
      if (!rewards) {
        return [];
      }

      const sortedRewards = rewards.claimableRewards.slice();
      sortedRewards.sort((reward1, reward2) => {
        return reward2.amount.toDec().gt(reward1.amount.toDec()) ? 1 : -1;
      });

      return sortedRewards.slice(0, maxValiadtors);
    }
  );

  private get stakingCurrency(): ERC20Currency | undefined {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      return;
    }

    return modularChainInfo.starknet.currencies.find(
      (c) => c.coinDenom === "STRK"
    );
  }
}

export class StakingInfoManager {
  @observable.shallow
  protected stakingInfoByStarknetHexAddress: Map<
    string,
    ObservableQueryStakingInfo
  > = new Map();

  @observable.shallow
  protected queryValidators: ObservableQueryValidators;

  protected sharedContext: QuerySharedContext;
  protected chainId: string;
  protected chainGetter: ChainGetter;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    queryValidators: ObservableQueryValidators
  ) {
    makeObservable(this);

    this.sharedContext = sharedContext;
    this.chainId = chainId;
    this.chainGetter = chainGetter;
    this.queryValidators = queryValidators;
  }

  /**
   * Returns the StakingInfo instance corresponding to the given starknet hex address.
   * If it does not exist, creates a new one (passing the hex address) and caches it.
   *
   * @param starknetHexAddress - The hex address of the Starknet account.
   */
  getStakingInfo = computedFn((starknetHexAddress: string) => {
    if (!this.stakingInfoByStarknetHexAddress.has(starknetHexAddress)) {
      runInAction(() => {
        const stakingInfo = new ObservableQueryStakingInfo(
          this.sharedContext,
          this.chainId,
          this.chainGetter,
          starknetHexAddress,
          this.queryValidators
        );
        // 만약 poolMemberInfoMap 생성 시 validators 정보를 추가로 저장할 필요가 있다면 이곳에서 처리할 수 있음.
        this.stakingInfoByStarknetHexAddress.set(
          starknetHexAddress,
          stakingInfo
        );
      });
    }
    return this.stakingInfoByStarknetHexAddress.get(starknetHexAddress)!;
  });
}
