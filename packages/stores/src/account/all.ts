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
  HasCosmosQueries,
  HasCosmwasmQueries,
  HasSecretQueries,
  QueriesStore,
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
    [HasCosmosQueries, HasSecretQueries, HasCosmwasmQueries]
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
    protected readonly queriesStore: QueriesStore<
      [HasCosmosQueries, HasSecretQueries, HasCosmwasmQueries]
    >,
    protected readonly opts: AccountSetOpts<
      CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts
    >
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.cosmos = new CosmosAccount(
      this as any,
      chainGetter,
      chainId,
      queriesStore as any
    );
    this.secret = new SecretAccount(
      this as any,
      chainGetter,
      chainId,
      queriesStore as any
    );
    this.cosmwasm = new CosmwasmAccount(
      this as any,
      chainGetter,
      chainId,
      queriesStore as any
    );
  }
}
