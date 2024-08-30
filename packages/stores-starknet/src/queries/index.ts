import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryStarknetERC20Balance } from "./erc20-balance";
import { ObservableQueryStarknetERC20ContractInfo } from "./erc20-contract-info";
import { ObservableQueryTokenContracts } from "./token-contracts";

export class StarknetQueriesStore {
  protected map: Map<string, StarknetQueriesStoreImpl> = new Map();

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    protected readonly tokenContractListURL: string
  ) {}

  public get(chainId: string): DeepReadonly<StarknetQueriesStoreImpl> {
    const prior = this.map.get(chainId);
    if (prior) {
      return prior;
    }

    const store = new StarknetQueriesStoreImpl(
      this.sharedContext,
      chainId,
      this.chainGetter,
      this.tokenContractListURL
    );
    this.map.set(chainId, store);
    return store;
  }
}

class StarknetQueriesStoreImpl {
  public readonly queryStarknetERC20Balance: DeepReadonly<ObservableQueryStarknetERC20Balance>;

  public readonly queryStarknetERC20ContractInfo: DeepReadonly<ObservableQueryStarknetERC20ContractInfo>;

  public readonly queryTokenContracts: DeepReadonly<ObservableQueryTokenContracts>;

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly tokenContractListURL: string
  ) {
    this.queryStarknetERC20Balance = new ObservableQueryStarknetERC20Balance(
      sharedContext
    );

    this.queryStarknetERC20ContractInfo =
      new ObservableQueryStarknetERC20ContractInfo(
        sharedContext,
        chainId,
        chainGetter
      );

    this.queryTokenContracts = new ObservableQueryTokenContracts(
      sharedContext,
      chainId,
      tokenContractListURL
    );
  }
}
