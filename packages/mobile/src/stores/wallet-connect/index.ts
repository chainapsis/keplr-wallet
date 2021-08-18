import AsyncStorage from "@react-native-async-storage/async-storage";
import WalletConnectClient, { CLIENT_EVENTS } from "@walletconnect/client";
import { SessionTypes } from "@walletconnect/types";
import { AccountSetBase, AccountStore } from "@keplr-wallet/stores";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { ChainStore } from "../chain";

export abstract class WalletConnectManager {
  @observable.ref
  protected client?: WalletConnectClient = undefined;

  protected constructor(
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: AccountStore<AccountSetBase<any, any>>
  ) {
    makeObservable(this);

    this.init();
  }

  async init() {
    const client = await WalletConnectClient.init({
      controller: true,
      relayProvider: "wss://relay.walletconnect.org",
      // TODO: Set metadata properly.
      metadata: {
        name: "Keplr",
        description: "Wallet for interchain",
        url: "#",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
      },
      storageOptions: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        asyncStorage: AsyncStorage,
      },
    });

    runInAction(() => {
      this.client = client;
    });

    this.client!.on(CLIENT_EVENTS.session.proposal, this.onSessionProposal);
  }

  protected async waitInit(): Promise<void> {
    if (this.client) {
      return;
    }

    return new Promise<void>((resolve) => {
      const disposer = autorun(() => {
        if (this.client) {
          resolve();
          if (disposer) {
            disposer();
          }
        }
      });
    });
  }

  async pair(uri: string) {
    await this.waitInit();

    await this.client!.pair({ uri });
  }

  protected readonly onSessionProposal = async (
    proposal: SessionTypes.Proposal
  ) => {
    await this.waitInit();

    try {
      const capiChainIds = proposal.permissions.blockchain.chains;
      for (const capiChainId of capiChainIds) {
        const { namespace, chainId } = this.parseCAIPChainId(capiChainId);
        if (namespace !== "cosmos") {
          throw new Error(`namespace (${namespace}) is not supported`);
        }

        if (!this.chainStore.hasChain(chainId)) {
          throw new Error(`chain id (${chainId}) is not supported`);
        }
      }

      const accounts: string[] = [];
      for (const capiChainId of capiChainIds) {
        const { chainId } = this.parseCAIPChainId(capiChainId);

        accounts.push(
          this.formatCAIPAccountId(
            "cosmos",
            chainId,
            await this.getAddressFromAccountStore(chainId)
          )
        );
      }

      await this.requestSessionProposalApproval(proposal);

      await this.client!.approve({
        proposal,
        response: {
          state: {
            accounts,
          },
        },
      });
    } catch (e) {
      await this.client!.reject({
        proposal,
        // TODO: Format the error message
        reason: {
          code: 1,
          message: e.message,
        },
      });
    }
  };

  protected abstract requestSessionProposalApproval(
    proposal: SessionTypes.Proposal
  ): Promise<void>;

  // The address in the account store is the observable property,
  // and it is not fetched until the account is actually used.
  // Thus, just getting the bech32Address is not enough and it can be just the empty string.
  // So, you need to observe the bech32Address before actually it is fetched.
  protected async getAddressFromAccountStore(chainId: string): Promise<string> {
    if (!this.chainStore.hasChain(chainId)) {
      throw new Error(`chain id (${chainId}) is not supported`);
    }

    const account = this.accountStore.getAccount(chainId);
    if (account.bech32Address) {
      return account.bech32Address;
    }

    return new Promise<string>((resolve) => {
      const disposer = autorun(() => {
        if (account.bech32Address) {
          resolve(account.bech32Address);
          if (disposer) {
            disposer();
          }
        }
      });
    });
  }

  protected parseCAIPChainId(
    caipChainId: string
  ): {
    namespace: string;
    chainId: string;
  } {
    const [namespace, chainId] = caipChainId.split(":");
    return {
      namespace,
      chainId,
    };
  }

  protected formatCAIPChainId(namespace: string, chainId: string) {
    return `${namespace}:${chainId}`;
  }

  protected formatCAIPAccountId(
    namespace: string,
    chainId: string,
    address: string
  ) {
    return `${namespace}:${chainId}:${address}`;
  }

  protected parseCAIPAccountId(
    caipAccount: string
  ): { namespace: string; chainId: string; address: string } {
    const [namespace, chainId, address] = caipAccount.split(":");
    return { namespace, chainId, address };
  }
}

export interface ProposalApproval {
  key: string;
  proposal: SessionTypes.Proposal;
  resolve: () => void;
  reject: () => void;
}

export class WalletConnectStore extends WalletConnectManager {
  @observable.shallow
  protected _pendingProposalApprovals: ProposalApproval[] = [];

  constructor(
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: AccountStore<AccountSetBase<any, any>>
  ) {
    super(chainStore, accountStore);

    makeObservable(this);
  }

  get pendingProposalApprovals(): ProposalApproval[] {
    return this._pendingProposalApprovals;
  }

  protected requestSessionProposalApproval(
    proposal: SessionTypes.Proposal
  ): Promise<void> {
    let resolver: () => void;
    let rejector: (e: Error) => void;
    const promise = new Promise<void>((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });

    const key = this.pendingProposalApprovals.length.toString();

    const approval: ProposalApproval = {
      key,
      proposal,
      resolve: () => {
        resolver();
        this.removeProposalApproval(key);
      },
      reject: () => {
        rejector(new Error("Rejected"));
        this.removeProposalApproval(key);
      },
    };

    this.pushProposalApproval(approval);

    return promise;
  }

  @action
  protected pushProposalApproval(approval: ProposalApproval) {
    if (
      !this.pendingProposalApprovals.find(
        (pending) => pending.key === approval.key
      )
    ) {
      this._pendingProposalApprovals.push(approval);
    }
  }

  @action
  protected removeProposalApproval(key: string) {
    const index = this.pendingProposalApprovals.findIndex(
      (pending) => pending.key === key
    );
    if (index >= 0) {
      this._pendingProposalApprovals.splice(index, 1);
    }
  }
}
