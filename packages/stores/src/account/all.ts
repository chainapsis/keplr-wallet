import { AccountSetBase, AccountSetOpts } from "./base";
import {
  AccountWithCosmos,
  CosmosAccount,
  CosmosMsgOpts,
  HasCosmosAccount,
} from "./cosmos";
import {
  AccountWithSecret,
  HasSecretAccount,
  SecretAccount,
  SecretMsgOpts,
} from "./secret";
import {
  CosmosQueries,
  CosmwasmQueries,
  SecretQueries,
  IQueriesStore,
} from "../query";
import deepmerge from "deepmerge";
import { DeepReadonly } from "utility-types";
import { ChainGetter } from "../common";
import {
  AccountWithCosmwasm,
  CosmwasmAccount,
  CosmwasmMsgOpts,
  HasCosmwasmAccount,
} from "./cosmwasm";

export class AccountWithAll
  extends AccountSetBase<
    CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts,
    CosmosQueries & SecretQueries & CosmwasmQueries
  >
  implements HasCosmosAccount, HasSecretAccount, HasCosmwasmAccount {
  static readonly defaultMsgOpts: CosmosMsgOpts &
    SecretMsgOpts &
    CosmwasmMsgOpts = deepmerge(
    AccountWithCosmos.defaultMsgOpts,
    deepmerge(
      AccountWithSecret.defaultMsgOpts,
      AccountWithCosmwasm.defaultMsgOpts
    )
  );

  public readonly cosmos: DeepReadonly<CosmosAccount>;
  public readonly secret: DeepReadonly<SecretAccount>;
  public readonly cosmwasm: DeepReadonly<CosmwasmAccount>;

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & SecretQueries & CosmwasmQueries
    >,
    protected readonly opts: AccountSetOpts<
      CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts
    >
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.cosmos = new CosmosAccount(this, chainGetter, chainId, queriesStore);
    this.secret = new SecretAccount(this, chainGetter, chainId, queriesStore);
    this.cosmwasm = new CosmwasmAccount(
      this,
      chainGetter,
      chainId,
      queriesStore
    );
  }
}
