import {CommunityChainInfoRepo, EmbedChainInfos} from '../config';

import {
  ChainStore,
  AccountStore,
  ChainSuggestStore,
  CosmosAccount,
  getKeplrFromWindow,
  InteractionStore,
  KeyRingStore,
  PermissionStore,
  QueriesStore,
  SignInteractionStore,
  CosmosQueries,
} from '@keplr-wallet/stores';
import {MemoryKVStore} from '@keplr-wallet/common';
import {RNEnv, RNRouterUI, RNMessageRequesterInternal} from '../router';
import {APP_PORT} from '@keplr-wallet/router';
import EventEmitter from 'eventemitter3';

export class RootStore {
  public readonly keyRingStore: KeyRingStore;
  public readonly chainStore: ChainStore;

  public readonly interactionStore: InteractionStore;
  public readonly permissionStore: PermissionStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly chainSuggestStore: ChainSuggestStore;

  public readonly queriesStore: QueriesStore<[CosmosQueries]>;
  public readonly accountStore: AccountStore<[CosmosAccount]>;

  constructor() {
    const router = new RNRouterUI(RNEnv.produceEnv);

    const eventEmitter = new EventEmitter();

    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new RNMessageRequesterInternal(),
    );

    this.keyRingStore = new KeyRingStore(
      {
        dispatchEvent: (type: string) => {
          eventEmitter.emit(type);
        },
      },
      new RNMessageRequesterInternal(),
    );

    this.chainStore = new ChainStore(EmbedChainInfos);

    this.permissionStore = new PermissionStore(
      this.interactionStore,
      new RNMessageRequesterInternal(),
    );
    this.signInteractionStore = new SignInteractionStore(this.interactionStore);
    this.chainSuggestStore = new ChainSuggestStore(
      this.interactionStore,
      CommunityChainInfoRepo,
    );

    this.queriesStore = new QueriesStore(
      new MemoryKVStore('store_queries'),
      this.chainStore,
      {
        responseDebounceMs: 75,
      },
      CosmosQueries.use(),
    );

    this.accountStore = new AccountStore(
      {
        addEventListener: (type: string, fn: () => void) => {
          eventEmitter.addListener(type, fn);
        },
        removeEventListener: (type: string, fn: () => void) => {
          eventEmitter.removeListener(type, fn);
        },
      },
      this.chainStore,
      getKeplrFromWindow,
      () => {
        return {
          suggestChain: false,
          autoInit: true,
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: chainId => {
          // In certik, change the msg type of the MsgSend to "bank/MsgSend"
          if (chainId.startsWith('shentu-')) {
            return {
              send: {
                native: {
                  type: 'bank/MsgSend',
                },
              },
            };
          }

          // In akash or sifchain, increase the default gas for sending
          if (
            chainId.startsWith('akashnet-') ||
            chainId.startsWith('sifchain')
          ) {
            return {
              send: {
                native: {
                  gas: 120000,
                },
              },
            };
          }

          if (chainId.startsWith('secret-')) {
            return {
              send: {
                native: {
                  gas: 20000,
                },
              },
              withdrawRewards: {
                gas: 25000,
              },
            };
          }

          // For terra related chains
          if (
            chainId.startsWith('bombay-') ||
            chainId.startsWith('columbus-')
          ) {
            return {
              send: {
                native: {
                  type: 'bank/MsgSend',
                },
              },
              withdrawRewards: {
                type: 'distribution/MsgWithdrawDelegationReward',
              },
            };
          }

          if (chainId.startsWith('evmos_') || chainId.startsWith('planq_')) {
            return {
              send: {
                native: {
                  gas: 140000,
                },
              },
              withdrawRewards: {
                gas: 200000,
              },
            };
          }

          if (chainId.startsWith('osmosis')) {
            return {
              send: {
                native: {
                  gas: 100000,
                },
              },
              withdrawRewards: {
                gas: 300000,
              },
            };
          }

          if (chainId.startsWith('stargaze-')) {
            return {
              send: {
                native: {
                  gas: 100000,
                },
              },
              withdrawRewards: {
                gas: 200000,
              },
            };
          }
        },
      }),
    );

    router.listen(APP_PORT);
  }
}

export function createRootStore() {
  return new RootStore();
}
