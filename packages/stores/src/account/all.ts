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
  QueriesSetBase,
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
    HasCosmosQueries & HasSecretQueries & HasCosmwasmQueries
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
      QueriesSetBase & HasCosmosQueries & HasSecretQueries & HasCosmwasmQueries
    >,
    protected readonly opts: AccountSetOpts<
      CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts
    >
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.cosmos = new CosmosAccount(
      this as AccountSetBase<CosmosMsgOpts, HasCosmosQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
    this.secret = new SecretAccount(
      this as AccountSetBase<SecretMsgOpts, HasSecretQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
    this.cosmwasm = new CosmwasmAccount(
      this as AccountSetBase<CosmwasmMsgOpts, HasCosmwasmQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
  }
}
