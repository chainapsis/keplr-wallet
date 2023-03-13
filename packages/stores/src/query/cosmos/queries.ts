import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
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
import {
  ObservableQueryCosmosBalanceRegistry,
  ObservableQuerySpendableBalances,
} from "./balance";
import { ObservableQueryIrisMintingInfation } from "./supply/iris-minting";
import { DeepReadonly } from "utility-types";
import {
  ObservableQueryOsmosisEpochProvisions,
  ObservableQueryOsmosisEpochs,
  ObservableQueryOsmosisMintParmas,
} from "./supply/osmosis";
import { ObservableQueryDistributionParams } from "./distribution";
import { ObservableQueryRPCStatus } from "./status";
import { ObservableQueryJunoAnnualProvisions } from "./supply/juno";
import {
  ObservableQueryStrideEpochProvisions,
  ObservableQueryStrideMintParams,
} from "./supply/stride";
import { ObservableQueryAuthZGranter } from "./authz";
import { QuerySharedContext } from "../../common";

export interface CosmosQueries {
  cosmos: CosmosQueriesImpl;
}

export const CosmosQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => CosmosQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        cosmos: new CosmosQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class CosmosQueriesImpl {
  public readonly queryRPCStatus: DeepReadonly<ObservableQueryRPCStatus>;

  public readonly queryAccount: DeepReadonly<ObservableQueryAccount>;
  public readonly querySpendableBalances: DeepReadonly<ObservableQuerySpendableBalances>;
  public readonly queryMint: DeepReadonly<ObservableQueryMintingInfation>;
  public readonly queryPool: DeepReadonly<ObservableQueryStakingPool>;
  public readonly queryStakingParams: DeepReadonly<ObservableQueryStakingParams>;
  public readonly querySupplyTotal: DeepReadonly<ObservableQuerySupplyTotal>;
  public readonly queryDistributionParams: DeepReadonly<ObservableQueryDistributionParams>;
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
  public readonly queryAuthZGranter: DeepReadonly<ObservableQueryAuthZGranter>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryRPCStatus = new ObservableQueryRPCStatus(
      sharedContext,
      chainId,
      chainGetter
    );

    this.querySifchainAPY = new ObservableQuerySifchainLiquidityAPY(
      sharedContext,
      chainId
    );

    base.queryBalances.addBalanceRegistry(
      new ObservableQueryCosmosBalanceRegistry(sharedContext)
    );

    this.queryAccount = new ObservableQueryAccount(
      sharedContext,
      chainId,
      chainGetter
    );
    this.querySpendableBalances = new ObservableQuerySpendableBalances(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryMint = new ObservableQueryMintingInfation(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryPool = new ObservableQueryStakingPool(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryStakingParams = new ObservableQueryStakingParams(
      sharedContext,
      chainId,
      chainGetter
    );
    this.querySupplyTotal = new ObservableQuerySupplyTotal(
      sharedContext,
      chainId,
      chainGetter
    );

    const osmosisMintParams = new ObservableQueryOsmosisMintParmas(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryDistributionParams = new ObservableQueryDistributionParams(
      sharedContext,
      chainId,
      chainGetter
    );

    const queryStrideMintParams = new ObservableQueryStrideMintParams(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryInflation = new ObservableQueryInflation(
      chainId,
      chainGetter,
      this.queryMint,
      this.queryPool,
      this.querySupplyTotal,
      new ObservableQueryIrisMintingInfation(
        sharedContext,
        chainId,
        chainGetter
      ),
      this.querySifchainAPY,
      new ObservableQueryOsmosisEpochs(sharedContext, chainId, chainGetter),
      new ObservableQueryOsmosisEpochProvisions(
        sharedContext,
        chainId,
        chainGetter,
        osmosisMintParams
      ),
      osmosisMintParams,
      new ObservableQueryJunoAnnualProvisions(
        sharedContext,
        chainId,
        chainGetter
      ),
      this.queryDistributionParams,
      new ObservableQueryStrideEpochProvisions(
        sharedContext,
        chainId,
        chainGetter
      ),
      queryStrideMintParams
    );
    this.queryRewards = new ObservableQueryRewards(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryDelegations = new ObservableQueryDelegations(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryUnbondingDelegations = new ObservableQueryUnbondingDelegations(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryValidators = new ObservableQueryValidators(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryGovernance = new ObservableQueryGovernance(
      sharedContext,
      chainId,
      chainGetter,
      this.queryPool
    );
    this.queryProposalVote = new ObservableQueryProposalVote(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryIBCClientState = new ObservableQueryIBCClientState(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryIBCChannel = new ObservableQueryIBCChannel(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryIBCDenomTrace = new ObservableQueryDenomTrace(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryAuthZGranter = new ObservableQueryAuthZGranter(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
