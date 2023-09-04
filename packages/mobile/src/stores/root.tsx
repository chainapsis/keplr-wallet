import {CommunityChainInfoRepo, EmbedChainInfos} from '../config';

import {
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
  CoinGeckoPriceStore,
  CosmwasmQueries,
  SecretQueries,
  OsmosisQueries,
  ICNSQueries,
  SecretAccount,
} from '@keplr-wallet/stores';
import {AsyncKVStore} from '../common';
import {RNEnv, RNRouterUI, RNMessageRequesterInternal} from '../router';
import {APP_PORT} from '@keplr-wallet/router';
import EventEmitter from 'eventemitter3';
import {HugeQueriesStore} from './huge-queries';
import {ChainStore} from './chain';

export class RootStore {
  public readonly keyRingStore: KeyRingStore;
  public readonly chainStore: ChainStore;

  public readonly hugeQueriesStore: HugeQueriesStore;
  public readonly priceStore: CoinGeckoPriceStore;

  public readonly interactionStore: InteractionStore;
  public readonly permissionStore: PermissionStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly chainSuggestStore: ChainSuggestStore;

  public readonly queriesStore: QueriesStore<
    [
      // AgoricQueries,
      CosmosQueries,
      CosmwasmQueries,
      SecretQueries,
      OsmosisQueries,
      // KeplrETCQueries,
      ICNSQueries,
      // TokenContractsQueries,
    ]
  >;
  public readonly accountStore: AccountStore<[CosmosAccount, SecretAccount]>;

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

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      this.keyRingStore,
      new RNMessageRequesterInternal(),
    );

    this.permissionStore = new PermissionStore(
      this.interactionStore,
      new RNMessageRequesterInternal(),
    );
    this.signInteractionStore = new SignInteractionStore(this.interactionStore);
    this.chainSuggestStore = new ChainSuggestStore(
      this.interactionStore,
      CommunityChainInfoRepo,
    );

    //FIXME - @keplr-wallet/stores를 최신 버전으로 업데이트를 해야함
    this.queriesStore = new QueriesStore(
      new AsyncKVStore('store_queries'),
      this.chainStore,
      {
        responseDebounceMs: 75,
      },
      CosmosQueries.use(),
      // // AgoricQueries.use(),
      CosmwasmQueries.use(),
      SecretQueries.use({
        apiGetter: getKeplrFromWindow,
      }),
      OsmosisQueries.use(),
      // KeplrETCQueries.use({
      //   ethereumURL: EthereumEndpoint,
      // }),
      ICNSQueries.use(),
      // TokenContractsQueries.use({
      //   tokenContractListURL: TokenContractListURL,
      // }),
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
      SecretAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: chainId => {
          if (chainId.startsWith('secret-')) {
            return {
              send: {
                secret20: {
                  gas: 175000,
                },
              },
              createSecret20ViewingKey: {
                gas: 175000,
              },
            };
          }
        },
      }),
    );

    this.priceStore = new CoinGeckoPriceStore(
      new AsyncKVStore('store_prices'),
      {
        usd: {
          currency: 'usd',
          symbol: '$',
          maxDecimals: 2,
          locale: 'en-US',
        },
        eur: {
          currency: 'eur',
          symbol: '€',
          maxDecimals: 2,
          locale: 'de-DE',
        },
        gbp: {
          currency: 'gbp',
          symbol: '£',
          maxDecimals: 2,
          locale: 'en-GB',
        },
        cad: {
          currency: 'cad',
          symbol: 'CA$',
          maxDecimals: 2,
          locale: 'en-CA',
        },
        rub: {
          currency: 'rub',
          symbol: '₽',
          maxDecimals: 0,
          locale: 'ru',
        },
        krw: {
          currency: 'krw',
          symbol: '₩',
          maxDecimals: 0,
          locale: 'ko-KR',
        },
        hkd: {
          currency: 'hkd',
          symbol: 'HK$',
          maxDecimals: 1,
          locale: 'en-HK',
        },
        cny: {
          currency: 'cny',
          symbol: '¥',
          maxDecimals: 1,
          locale: 'zh-CN',
        },
        jpy: {
          currency: 'jpy',
          symbol: '¥',
          maxDecimals: 0,
          locale: 'ja-JP',
        },
      },
      'usd',
    );

    this.hugeQueriesStore = new HugeQueriesStore(
      this.chainStore,
      this.queriesStore,
      this.accountStore,
      this.priceStore,
    );

    router.listen(APP_PORT);
  }
}

export function createRootStore() {
  return new RootStore();
}
