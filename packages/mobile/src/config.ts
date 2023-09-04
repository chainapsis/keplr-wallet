import {Bech32Address} from '@keplr-wallet/cosmos';
import {ChainInfo} from '@keplr-wallet/types';

export const CoinGeckoAPIEndPoint = 'https://api.coingecko.com/api/v3';

export const EthereumEndpoint =
  'https://mainnet.infura.io/v3/eeb00e81cdb2410098d5a270eff9b341';

export interface AppChainInfo extends ChainInfo {
  readonly chainSymbolImageUrl?: string;
  readonly hideInUI?: boolean;
  readonly txExplorer?: {
    readonly name: string;
    readonly txUrl: string;
  };
}

export const EmbedChainInfos: AppChainInfo[] = [
  {
    rpc: 'https://rpc-cosmoshub.keplr.app',
    rest: 'https://lcd-cosmoshub.keplr.app',
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos Hub',
    stakeCurrency: {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('cosmos'),
    currencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/cosmos/txs/{txHash}',
    },
  },
  {
    rpc: 'https://rpc-osmosis.keplr.app',
    rest: 'https://lcd-osmosis.keplr.app',
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
    },
    bip44: {coinType: 118},
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
      },
      {
        coinDenom: 'ION',
        coinMinimalDenom: 'uion',
        coinDecimals: 6,
        coinGeckoId: 'ion',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
        gasPriceStep: {
          low: 0,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    features: [
      'ibc-transfer',
      'ibc-go',
      'cosmwasm',
      'wasmd_0.24+',
      'osmosis-txfees',
    ],
  },
];

export const CommunityChainInfoRepo = {
  organizationName: 'chainapsis',
  repoName: 'keplr-chain-registry',
  branchName: 'main',
};
