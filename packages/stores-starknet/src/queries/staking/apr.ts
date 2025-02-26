import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { Dec } from "@keplr-wallet/unit";
import { computed, makeObservable, observable } from "mobx";
import { ObservableStarknetChainJsonRpcQuery } from "../starknet-chain-json-rpc";

export class ObservableQueryYearlyMint extends ObservableStarknetChainJsonRpcQuery<
  string[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "starknet_call", {
      request: {
        // Staking Minting Curve Contract Address
        contract_address:
          "0x00ca1705e74233131dbcdee7f1b8d2926bf262168c7df339004b3f46015b6984",
        calldata: [],
        // selector.getSelectorFromName("yearly_mint")
        entry_point_selector:
          "0x02e4624c78f168ac6115cadd7f1e6fe304cb84479579b0c5b3ec352d41adc2f4",
      },
    });

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (this.chainId === "starknet:SN_SEPOLIA") {
      return false;
    }

    return super.canFetch();
  }

  @computed
  get yearlyMint(): Dec | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    if (this.response.data.length < 1) {
      return undefined;
    }

    const hexYearlyMint = this.response.data[0];

    return new Dec(BigInt(hexYearlyMint));
  }
}

export class ObservableQueryTotalStake extends ObservableStarknetChainJsonRpcQuery<
  string[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "starknet_call", {
      request: {
        contract_address:
          "0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7",
        calldata: [],
        // selector.getSelectorFromName("get_total_stake")
        entry_point_selector:
          "0x0226ffc5db8f68325947f4c4fcbea7117624ed26d4a1354693f63de203c453c8",
      },
    });

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return this.chainId === "starknet:SN_MAIN";
  }

  @computed
  get totalStake(): Dec | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    if (this.response.data.length < 1) {
      return undefined;
    }

    const hexTotalStake = this.response.data[0];

    // ensure total stake is not zero
    const totalStake = new Dec(BigInt(hexTotalStake));
    if (totalStake.isZero()) {
      return undefined;
    }

    return totalStake;
  }
}

export class ObservableQueryStakingApr {
  @observable.shallow
  protected yearlyMint: ObservableQueryYearlyMint;

  @observable.shallow
  protected totalStake: ObservableQueryTotalStake;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.yearlyMint = new ObservableQueryYearlyMint(
      sharedContext,
      chainId,
      chainGetter
    );
    this.totalStake = new ObservableQueryTotalStake(
      sharedContext,
      chainId,
      chainGetter
    );
  }

  @computed
  get apr(): Dec | undefined {
    if (!this.yearlyMint.yearlyMint || !this.totalStake.totalStake) {
      return undefined;
    }

    return this.yearlyMint.yearlyMint
      .mul(new Dec(100))
      .quo(this.totalStake.totalStake);
  }
}
