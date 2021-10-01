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
  HasSecretQueries,
  QueriesSetBase,
  QueriesStore,
} from "../query";
import deepmerge from "deepmerge";
import { DeepReadonly } from "utility-types";
import { ChainGetter } from "../common";

export class AccountWithCosmosAndSecret
  extends AccountSetBase<
    CosmosMsgOpts & SecretMsgOpts,
    HasCosmosQueries & HasSecretQueries
  >
  implements HasCosmosAccount, HasSecretAccount {
  static readonly defaultMsgOpts: CosmosMsgOpts & SecretMsgOpts = deepmerge(
    AccountWithCosmos.defaultMsgOpts,
    AccountWithSecret.defaultMsgOpts
  );

  public readonly cosmos: DeepReadonly<CosmosAccount>;
  public readonly secret: DeepReadonly<SecretAccount>;

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasCosmosQueries & HasSecretQueries
    >,
    protected readonly opts: AccountSetOpts<CosmosMsgOpts & SecretMsgOpts>
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
  }
}
