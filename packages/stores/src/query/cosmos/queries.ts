import { QueriesSetBase } from "../queries";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { ObservableQueryBlock } from "./block";
import { ObservableQueryAccount } from "./account";
import {
  ObservableQueryInflation,
  ObservableQueryMintingInfation,
  ObservableQuerySupplyTotal,
} from "./supply";
import {
  ObservableQueryDelegations,
  ObservableQueryRewards,
  ObservableQueryStakingParams,
  ObservableQueryStakingPool,
  ObservableQueryUnbondingDelegations,
  ObservableQueryValidators,
} from "./staking";
import {
  ObservableQueryGovernance,
  ObservableQueryProposalVote,
} from "./governance";
import {
  ObservableQueryDenomTrace,
  ObservableQueryIBCChannel,
  ObservableQueryIBCClientState,
} from "./ibc";
import { ObservableQuerySifchainLiquidityAPY } from "./supply/sifchain";
import { ObservableQueryCosmosBalanceRegistry } from "./balance";
import { ObservableQueryIrisMintingInfation } from "./supply/iris-minting";
import { DeepReadonly } from "utility-types";
import {
  ObservableQueryOsmosisEpochProvisions,
  ObservableQueryOsmosisEpochs,
  ObservableQueryOsmosisMintParmas,
} from "./supply/osmosis";

export interface HasCosmosQueries {
  cosmos: CosmosQueries;
}

export class QueriesWithCosmos
  extends QueriesSetBase
  implements HasCosmosQueries {
  public cosmos: CosmosQueries;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter);

    this.cosmos = new CosmosQueries(this, kvStore, chainId, chainGetter);
  }
}

export class CosmosQueries {
  public readonly queryBlock: DeepReadonly<ObservableQueryBlock>;
  public readonly queryAccount: DeepReadonly<ObservableQueryAccount>;
  public readonly queryMint: DeepReadonly<ObservableQueryMintingInfation>;
  public readonly queryPool: DeepReadonly<ObservableQueryStakingPool>;
  public readonly queryStakingParams: DeepReadonly<ObservableQueryStakingParams>;
  public readonly querySupplyTotal: DeepReadonly<ObservableQuerySupplyTotal>;
  public readonly queryInflation: DeepReadonly<ObservableQueryInflation>;
  public readonly queryRewards: DeepReadonly<ObservableQueryRewards>;
  public readonly queryDelegations: DeepReadonly<ObservableQueryDelegations>;
  public readonly queryUnbondingDelegations: DeepReadonly<ObservableQueryUnbondingDelegations>;
  public readonly queryValidators: DeepReadonly<ObservableQueryValidators>;
  public readonly queryGovernance: DeepReadonly<ObservableQueryGovernance>;
  public readonly queryProposalVote: DeepReadonly<ObservableQueryProposalVote>;

  public readonly queryIBCClientState: DeepReadonly<ObservableQueryIBCClientState>;
  public readonly queryIBCChannel: DeepReadonly<ObservableQueryIBCChannel>;
  public readonly queryIBCDenomTrace: DeepReadonly<ObservableQueryDenomTrace>;

  public readonly querySifchainAPY: DeepReadonly<ObservableQuerySifchainLiquidityAPY>;

  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.querySifchainAPY = new ObservableQuerySifchainLiquidityAPY(
      kvStore,
      chainId
    );

    base.queryBalances.addBalanceRegistry(
      new ObservableQueryCosmosBalanceRegistry(kvStore)
    );

    this.queryBlock = new ObservableQueryBlock(kvStore, chainId, chainGetter);
    this.queryAccount = new ObservableQueryAccount(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryMint = new ObservableQueryMintingInfation(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryPool = new ObservableQueryStakingPool(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryStakingParams = new ObservableQueryStakingParams(
      kvStore,
      chainId,
      chainGetter
    );
    this.querySupplyTotal = new ObservableQuerySupplyTotal(
      kvStore,
      chainId,
      chainGetter
    );

    const osmosisMintParams = new ObservableQueryOsmosisMintParmas(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryInflation = new ObservableQueryInflation(
      chainId,
      chainGetter,
      this.queryMint,
      this.queryPool,
      this.querySupplyTotal,
      new ObservableQueryIrisMintingInfation(kvStore, chainId, chainGetter),
      this.querySifchainAPY,
      new ObservableQueryOsmosisEpochs(kvStore, chainId, chainGetter),
      new ObservableQueryOsmosisEpochProvisions(
        kvStore,
        chainId,
        chainGetter,
        osmosisMintParams
      ),
      osmosisMintParams
    );
    this.queryRewards = new ObservableQueryRewards(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryDelegations = new ObservableQueryDelegations(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryUnbondingDelegations = new ObservableQueryUnbondingDelegations(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryValidators = new ObservableQueryValidators(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryGovernance = new ObservableQueryGovernance(
      kvStore,
      chainId,
      chainGetter,
      this.queryPool
    );
    this.queryProposalVote = new ObservableQueryProposalVote(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryIBCClientState = new ObservableQueryIBCClientState(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryIBCChannel = new ObservableQueryIBCChannel(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryIBCDenomTrace = new ObservableQueryDenomTrace(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
