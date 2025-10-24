import {
  ChainedFunctionifyTuple,
  HasMapStore,
  IObject,
  mergeStores,
} from "../common";
import { ChainGetter } from "../chain";
import { AccountSetBase, AccountSetBaseSuper, AccountSetOpts } from "./base";
import { UnionToIntersection } from "utility-types";
import { AccountSharedContext } from "./context";
import { Keplr } from "@keplr-wallet/types";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface IAccountStore<T extends IObject = {}> {
  getAccount(chainId: string): AccountSetBase & T;
  hasAccount(chainId: string): boolean;
}

export interface IAccountStoreWithInjects<Injects extends Array<IObject>> {
  getAccount(
    chainId: string
  ): AccountSetBase & UnionToIntersection<Injects[number]>;
  hasAccount(chainId: string): boolean;
}

export class AccountStore<
  Injects extends Array<IObject>,
  AccountSetReturn = AccountSetBase & UnionToIntersection<Injects[number]>
> extends HasMapStore<AccountSetReturn> {
  protected accountSetCreators: ChainedFunctionifyTuple<
    AccountSetBaseSuper,
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
    protected readonly getKeplr: () => Promise<Keplr | undefined>,
    protected readonly storeOptsCreator: (chainId: string) => AccountSetOpts,
    ...accountSetCreators: ChainedFunctionifyTuple<
      AccountSetBaseSuper,
      // chainGetter: ChainGetter,
      // chainId: string,
      [ChainGetter, string],
      Injects
    >
  ) {
    const sharedContext = new AccountSharedContext(getKeplr);

    super((chainId: string) => {
      const accountSetBase = new AccountSetBaseSuper(
        eventListener,
        chainGetter,
        chainId,
        sharedContext,
        storeOptsCreator(chainId)
      );

      return mergeStores(
        accountSetBase,
        [this.chainGetter, chainId],
        ...this.accountSetCreators
      );
    });

    this.accountSetCreators = accountSetCreators;
  }

  getAccount(chainId: string): AccountSetReturn {
    // XXX: 이렇게 쪼개진건 modular chain info가 추가되면서 이 경우도 따로 처리하기 위함임...
    if (this.chainGetter.hasModularChain(chainId)) {
      // chain identifier를 통한 접근도 허용하기 위해서 chainGetter를 통해 접근하도록 함.
      return this.get(this.chainGetter.getChain(chainId).chainId);
    }
    return this.get(chainId);
  }

  hasAccount(chainId: string): boolean {
    // XXX: 이렇게 쪼개진건 modular chain info가 추가되면서 이 경우도 따로 처리하기 위함임...
    if (this.chainGetter.hasModularChain(chainId)) {
      // chain identifier를 통한 접근도 허용하기 위해서 chainGetter를 통해 접근하도록 함.
      return this.has(this.chainGetter.getChain(chainId).chainId);
    }
    return this.has(chainId);
  }
}
