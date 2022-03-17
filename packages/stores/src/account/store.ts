import {
  ChainedFunctionifyTuple,
  ChainGetter,
  HasMapStore,
  IObject,
  mergeStores,
} from "../common";
import { AccountSetBase, AccountSetBaseSuper, AccountSetOpts } from "./base";
import { DeepPartial, UnionToIntersection } from "utility-types";

export interface AccountStoreOpts {
  defaultOpts: AccountSetOpts;
  chainOpts?: (DeepPartial<AccountSetOpts> & { chainId: string })[];
}

export class AccountStore<
  Injects extends Array<IObject>,
  AccountSetReturn = AccountSetBase & UnionToIntersection<Injects[number]>
> extends HasMapStore<AccountSetReturn> {
  protected accountSetCreators: ChainedFunctionifyTuple<
    { accountSetBase: AccountSetBaseSuper },
    // chainGetter: ChainGetter,
    // chainId: string,
    [ChainGetter, string],
    Injects
  >;

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly storeOpts: AccountStoreOpts,
    ...accountSetCreators: ChainedFunctionifyTuple<
      { accountSetBase: AccountSetBaseSuper },
      // chainGetter: ChainGetter,
      // chainId: string,
      [ChainGetter, string],
      Injects
    >
  ) {
    super((chainId: string) => {
      const accountSetBase = new AccountSetBaseSuper(
        eventListener,
        chainGetter,
        chainId,
        this.storeOpts.defaultOpts
      );

      const injected = mergeStores(
        { accountSetBase },
        [this.chainGetter, chainId],
        ...this.accountSetCreators
      );

      for (const key of Object.keys(injected)) {
        if (key !== "accountSetBase") {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          accountSetBase[key] = injected[key];
        }
      }

      return accountSetBase as any;
    });

    this.accountSetCreators = accountSetCreators;
  }

  getAccount(chainId: string): AccountSetReturn {
    return this.get(chainId);
  }

  hasAccount(chainId: string): boolean {
    return this.has(chainId);
  }
}
