import { HasMapStore } from "../common";
import { ChainGetter } from "../common";
import { QueriesStore } from "../query";
import { DeepPartial } from "utility-types";
import deepmerge from "deepmerge";
import { QueriesSetBase } from "../query";
import { AccountSetBase, AccountSetOpts } from "./base";

export interface AccountStoreOpts<MsgOpts> {
  defaultOpts: Omit<AccountSetOpts<MsgOpts>, "msgOpts"> &
    DeepPartial<Pick<AccountSetOpts<MsgOpts>, "msgOpts">>;
  chainOpts?: (DeepPartial<AccountSetOpts<MsgOpts>> & { chainId: string })[];
}

export class AccountStore<
  AccountSet extends AccountSetBase<unknown, unknown>,
  MsgOpts = AccountSet extends AccountSetBase<infer M, unknown> ? M : never,
  Queries = AccountSet extends AccountSetBase<unknown, infer Q> ? Q : never,
  Opts = AccountSetOpts<MsgOpts>
> extends HasMapStore<AccountSet> {
  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly accountSetCreator: (new (
      eventListener: {
        addEventListener: (type: string, fn: () => unknown) => void;
        removeEventListener: (type: string, fn: () => unknown) => void;
      },
      chainGetter: ChainGetter,
      chainId: string,
      queriesStore: QueriesStore<QueriesSetBase & Queries>,
      opts: Opts
    ) => AccountSet) & { defaultMsgOpts: MsgOpts },
    protected readonly chainGetter: ChainGetter,
    protected readonly queriesStore: QueriesStore<QueriesSetBase & Queries>,
    protected readonly storeOpts: AccountStoreOpts<MsgOpts>
  ) {
    super((chainId: string) => {
      return new accountSetCreator(
        this.eventListener,
        this.chainGetter,
        chainId,
        this.queriesStore,
        (deepmerge(
          deepmerge(
            {
              msgOpts: accountSetCreator.defaultMsgOpts,
            },
            this.storeOpts.defaultOpts
          ),
          this.storeOpts.chainOpts?.find((opts) => opts.chainId === chainId) ??
            {}
        ) as unknown) as Opts
      );
    });

    const defaultOpts = deepmerge(
      {
        msgOpts: accountSetCreator.defaultMsgOpts,
      },
      this.storeOpts.defaultOpts
    );
    for (const opts of this.storeOpts.chainOpts ?? []) {
      if (
        opts.prefetching ||
        (defaultOpts.prefetching && opts.prefetching !== false)
      ) {
        this.getAccount(opts.chainId);
      }
    }
  }

  getAccount(chainId: string): AccountSet {
    return this.get(chainId);
  }

  hasAccount(chainId: string): boolean {
    return this.has(chainId);
  }
}
