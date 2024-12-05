import {Bech32Address} from '@keplr-wallet/cosmos';
import {ChainInfo} from '@keplr-wallet/types';

export const EmbedChainInfos: ChainInfo[] = [
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
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/cosmos-hub'
        : 'http://localhost:8080/chains/cosmos-hub',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/cosmos-hub'
        : 'http://localhost:8080/chains/cosmos-hub',
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
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
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
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://app.osmosis.zone'
        : 'https://app.osmosis.zone',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/osmosis'
        : 'http://localhost:8080/chains/osmosis',
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
  {
    rpc: 'https://rpc-secret.keplr.app',
    rest: 'https://lcd-secret.keplr.app',
    chainId: 'secret-4',
    chainName: 'Secret Network',
    stakeCurrency: {
      coinDenom: 'SCRT',
      coinMinimalDenom: 'uscrt',
      coinDecimals: 6,
      coinGeckoId: 'secret',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/secret-network'
        : 'http://localhost:8080/chains/secret-network',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/secret-network'
        : 'http://localhost:8080/chains/secret-network',
    bip44: {
      coinType: 529,
    },
    alternativeBIP44s: [
      {
        coinType: 118,
      },
    ],
    bech32Config: Bech32Address.defaultBech32Config('secret'),
    currencies: [
      {
        coinDenom: 'SCRT',
        coinMinimalDenom: 'uscrt',
        coinDecimals: 6,
        coinGeckoId: 'secret',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'SCRT',
        coinMinimalDenom: 'uscrt',
        coinDecimals: 6,
        coinGeckoId: 'secret',
        gasPriceStep: {
          low: 0.2,
          average: 0.25,
          high: 0.3,
        },
      },
    ],
    features: ['secretwasm', 'ibc-go', 'ibc-transfer'],
  },
  {
    rpc: 'https://rpc-akash.keplr.app',
    rest: 'https://lcd-akash.keplr.app',
    chainId: 'akashnet-2',
    chainName: 'Akash',
    stakeCurrency: {
      coinDenom: 'AKT',
      coinMinimalDenom: 'uakt',
      coinDecimals: 6,
      coinGeckoId: 'akash-network',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/akash'
        : 'http://localhost:8080/chains/akash',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/akash'
        : 'http://localhost:8080/chains/akash',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('akash'),
    currencies: [
      {
        coinDenom: 'AKT',
        coinMinimalDenom: 'uakt',
        coinDecimals: 6,
        coinGeckoId: 'akash-network',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'AKT',
        coinMinimalDenom: 'uakt',
        coinDecimals: 6,
        coinGeckoId: 'akash-network',
      },
    ],
    features: ['ibc-transfer'],
  },
  {
    rpc: 'https://rpc-mars.keplr.app',
    rest: 'https://lcd-mars.keplr.app',
    chainId: 'mars-1',
    chainName: 'Mars Hub',
    stakeCurrency: {
      coinDenom: 'MARS',
      coinMinimalDenom: 'umars',
      coinDecimals: 6,
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/mars'
        : 'http://localhost:8080/chains/mars',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/mars'
        : 'http://localhost:8080/chains/mars',
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [
      {
        coinType: 330,
      },
    ],
    bech32Config: Bech32Address.defaultBech32Config('mars'),
    currencies: [
      {
        coinDenom: 'MARS',
        coinMinimalDenom: 'umars',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'MARS',
        coinMinimalDenom: 'umars',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0,
          average: 0,
          high: 0.01,
        },
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-crypto-org.keplr.app',
    rest: 'https://lcd-crypto-org.keplr.app',
    chainId: 'crypto-org-chain-mainnet-1',
    chainName: 'Crypto.org',
    stakeCurrency: {
      coinDenom: 'CRO',
      coinMinimalDenom: 'basecro',
      coinDecimals: 8,
      coinGeckoId: 'crypto-com-chain',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/crypto-org'
        : 'http://localhost:8080/chains/crypto-org',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/crypto-org'
        : 'http://localhost:8080/chains/crypto-org',
    bip44: {
      coinType: 394,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'cro',
      bech32PrefixAccPub: 'cropub',
      bech32PrefixValAddr: 'crocncl',
      bech32PrefixValPub: 'crocnclpub',
      bech32PrefixConsAddr: 'crocnclcons',
      bech32PrefixConsPub: 'crocnclconspub',
    },
    currencies: [
      {
        coinDenom: 'CRO',
        coinMinimalDenom: 'basecro',
        coinDecimals: 8,
        coinGeckoId: 'crypto-com-chain',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'CRO',
        coinMinimalDenom: 'basecro',
        coinDecimals: 8,
        coinGeckoId: 'crypto-com-chain',
        gasPriceStep: {
          low: 0.025,
          average: 0.03,
          high: 0.04,
        },
      },
    ],
    features: ['ibc-transfer'],
  },
  {
    rpc: 'https://rpc-iris.keplr.app',
    rest: 'https://lcd-iris.keplr.app',
    chainId: 'irishub-1',
    chainName: 'IRISnet',
    stakeCurrency: {
      coinDenom: 'IRIS',
      coinMinimalDenom: 'uiris',
      coinDecimals: 6,
      coinGeckoId: 'iris-network',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/irisnet'
        : 'http://localhost:8080/chains/irisnet',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/irisnet'
        : 'http://localhost:8080/chains/irisnet',
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [
      {
        coinType: 566,
      },
    ],
    bech32Config: {
      bech32PrefixAccAddr: 'iaa',
      bech32PrefixAccPub: 'iap',
      bech32PrefixValAddr: 'iva',
      bech32PrefixValPub: 'ivp',
      bech32PrefixConsAddr: 'ica',
      bech32PrefixConsPub: 'icp',
    },
    currencies: [
      {
        coinDenom: 'IRIS',
        coinMinimalDenom: 'uiris',
        coinDecimals: 6,
        coinGeckoId: 'iris-network',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'IRIS',
        coinMinimalDenom: 'uiris',
        coinDecimals: 6,
        coinGeckoId: 'iris-network',
        gasPriceStep: {
          low: 0.2,
          average: 0.3,
          high: 0.4,
        },
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
  },
  {
    rpc: 'https://rpc-regen.keplr.app',
    rest: 'https://lcd-regen.keplr.app',
    chainId: 'regen-1',
    chainName: 'Regen',
    stakeCurrency: {
      coinDenom: 'REGEN',
      coinMinimalDenom: 'uregen',
      coinDecimals: 6,
      coinGeckoId: 'regen',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/regen'
        : 'http://localhost:8080/chains/regen',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/regen'
        : 'http://localhost:8080/chains/regen',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('regen'),
    currencies: [
      {
        coinDenom: 'REGEN',
        coinMinimalDenom: 'uregen',
        coinDecimals: 6,
        coinGeckoId: 'regen',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'REGEN',
        coinMinimalDenom: 'uregen',
        coinDecimals: 6,
        coinGeckoId: 'regen',
        gasPriceStep: {
          low: 0.015,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    features: ['ibc-go', 'ibc-transfer'],
  },
  {
    rpc: 'https://rpc-persistence.keplr.app',
    rest: 'https://lcd-persistence.keplr.app',
    chainId: 'core-1',
    chainName: 'Persistence',
    stakeCurrency: {
      coinDenom: 'XPRT',
      coinMinimalDenom: 'uxprt',
      coinDecimals: 6,
      coinGeckoId: 'persistence',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/persistence'
        : 'http://localhost:8080/chains/persistence',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/persistence'
        : 'http://localhost:8080/chains/persistence',
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [
      {
        coinType: 750,
      },
    ],
    bech32Config: Bech32Address.defaultBech32Config('persistence'),
    currencies: [
      {
        coinDenom: 'XPRT',
        coinMinimalDenom: 'uxprt',
        coinDecimals: 6,
        coinGeckoId: 'persistence',
      },
      {
        coinDenom: 'STKATOM',
        coinMinimalDenom: 'stk/uatom',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'XPRT',
        coinMinimalDenom: 'uxprt',
        coinDecimals: 6,
        coinGeckoId: 'persistence',
        gasPriceStep: {
          low: 0,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
  },
  {
    rpc: 'https://rpc-sentinel.keplr.app',
    rest: 'https://lcd-sentinel.keplr.app',
    chainId: 'sentinelhub-2',
    chainName: 'Sentinel',
    stakeCurrency: {
      coinDenom: 'DVPN',
      coinMinimalDenom: 'udvpn',
      coinDecimals: 6,
      coinGeckoId: 'sentinel',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/sentinel'
        : 'http://localhost:8080/chains/sentinel',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/sentinel'
        : 'http://localhost:8080/chains/sentinel',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('sent'),
    currencies: [
      {
        coinDenom: 'DVPN',
        coinMinimalDenom: 'udvpn',
        coinDecimals: 6,
        coinGeckoId: 'sentinel',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'DVPN',
        coinMinimalDenom: 'udvpn',
        coinDecimals: 6,
        coinGeckoId: 'sentinel',
        gasPriceStep: {
          low: 0.1,
          average: 0.25,
          high: 0.4,
        },
      },
    ],
    features: ['ibc-transfer'],
  },
  {
    rpc: 'https://rpc-agoric.keplr.app',
    rest: 'https://lcd-agoric.keplr.app',
    chainId: 'agoric-3',
    chainName: 'Agoric',
    stakeCurrency: {
      coinDenom: 'BLD',
      coinMinimalDenom: 'ubld',
      coinDecimals: 6,
      coinGeckoId: 'agoric',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/agoric'
        : 'http://localhost:8080/chains/agoric',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/agoric'
        : 'http://localhost:8080/chains/agoric',
    bip44: {
      coinType: 564,
    },
    bech32Config: Bech32Address.defaultBech32Config('agoric'),
    currencies: [
      {
        coinDenom: 'BLD',
        coinMinimalDenom: 'ubld',
        coinDecimals: 6,
        coinGeckoId: 'agoric',
      },
      {
        coinDenom: 'IST',
        coinMinimalDenom: 'uist',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'BLD',
        coinMinimalDenom: 'ubld',
        coinDecimals: 6,
        coinGeckoId: 'agoric',
        gasPriceStep: {
          low: 0.012,
          average: 0.024,
          high: 0.071,
        },
      },
      {
        coinDenom: 'IST',
        coinMinimalDenom: 'uist',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.0034,
          average: 0.007,
          high: 0.02,
        },
      },
    ],
    features: ['ibc-go'],
  },
  {
    rpc: 'https://rpc-cyber.keplr.app',
    rest: 'https://lcd-cyber.keplr.app',
    chainId: 'bostrom',
    chainName: 'Bostrom',
    stakeCurrency: {
      coinDenom: 'BOOT',
      coinMinimalDenom: 'boot',
      coinDecimals: 0,
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/bostrom'
        : 'http://localhost:8080/chains/bostrom',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/bostrom'
        : 'http://localhost:8080/chains/bostrom',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('bostrom'),
    currencies: [
      {
        coinDenom: 'BOOT',
        coinMinimalDenom: 'boot',
        coinDecimals: 0,
      },
      {
        coinDenom: 'H',
        coinMinimalDenom: 'hydrogen',
        coinDecimals: 0,
      },
      {
        coinDenom: 'V',
        coinMinimalDenom: 'millivolt',
        coinDecimals: 3,
      },
      {
        coinDenom: 'A',
        coinMinimalDenom: 'milliampere',
        coinDecimals: 3,
      },
      {
        coinDenom: 'TOCYB',
        coinMinimalDenom: 'tocyb',
        coinDecimals: 0,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'BOOT',
        coinMinimalDenom: 'boot',
        coinDecimals: 0,
        gasPriceStep: {
          low: 0,
          average: 0,
          high: 0.01,
        },
      },
    ],
    features: ['ibc-transfer', 'cosmwasm', 'ibc-go'],
  },
  {
    rpc: 'https://rpc-juno.keplr.app',
    rest: 'https://lcd-juno.keplr.app',
    chainId: 'juno-1',
    chainName: 'Juno',
    stakeCurrency: {
      coinDenom: 'JUNO',
      coinMinimalDenom: 'ujuno',
      coinDecimals: 6,
      coinGeckoId: 'juno-network',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/juno'
        : 'http://localhost:8080/chains/juno',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/juno'
        : 'http://localhost:8080/chains/juno',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('juno'),
    currencies: [
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ujuno',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ujuno',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
        gasPriceStep: {
          low: 0.001,
          average: 0.0025,
          high: 0.004,
        },
      },
      {
        coinDenom: 'ATOM',
        coinMinimalDenom:
          'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.001 * 0.33,
          average: 0.0025 * 0.33,
          high: 0.004 * 0.33,
        },
      },
    ],
    features: ['cosmwasm', 'ibc-transfer', 'ibc-go', 'wasmd_0.24+'],
  },
  {
    rpc: 'https://rpc-stargaze.keplr.app',
    rest: 'https://lcd-stargaze.keplr.app',
    chainId: 'stargaze-1',
    chainName: 'Stargaze',
    stakeCurrency: {
      coinDenom: 'STARS',
      coinMinimalDenom: 'ustars',
      coinDecimals: 6,
      coinGeckoId: 'stargaze',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/stargaze'
        : 'http://localhost:8080/chains/stargaze',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/stargaze'
        : 'http://localhost:8080/chains/stargaze',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('stars'),
    currencies: [
      {
        coinDenom: 'STARS',
        coinMinimalDenom: 'ustars',
        coinDecimals: 6,
        coinGeckoId: 'stargaze',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'STARS',
        coinMinimalDenom: 'ustars',
        coinDecimals: 6,
        coinGeckoId: 'stargaze',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
  },
  {
    rpc: 'https://rpc-axelar.keplr.app',
    rest: 'https://lcd-axelar.keplr.app',
    chainId: 'axelar-dojo-1',
    chainName: 'Axelar',
    stakeCurrency: {
      coinDenom: 'AXL',
      coinMinimalDenom: 'uaxl',
      coinDecimals: 6,
      coinGeckoId: 'axelar',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/axelar'
        : 'http://localhost:8080/chains/axelar',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/axelar'
        : 'http://localhost:8080/chains/axelar',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('axelar'),
    currencies: [
      {
        coinDenom: 'AXL',
        coinMinimalDenom: 'uaxl',
        coinDecimals: 6,
        coinGeckoId: 'axelar',
      },
      {
        coinDenom: 'WETH',
        coinMinimalDenom: 'weth-wei',
        coinDecimals: 18,
        coinGeckoId: 'weth',
      },
      {
        coinDenom: 'USDC',
        coinMinimalDenom: 'uusdc',
        coinDecimals: 6,
        coinGeckoId: 'usd-coin',
      },
      {
        coinDenom: 'FRAX',
        coinMinimalDenom: 'frax-wei',
        coinDecimals: 18,
        coinGeckoId: 'frax',
      },
      {
        coinDenom: 'DAI',
        coinMinimalDenom: 'dai-wei',
        coinDecimals: 18,
        coinGeckoId: 'dai',
      },
      {
        coinDenom: 'USDT',
        coinMinimalDenom: 'uusdt',
        coinDecimals: 6,
        coinGeckoId: 'tether',
      },
      {
        coinDenom: 'WBTC',
        coinMinimalDenom: 'wbtc-satoshi',
        coinDecimals: 8,
        coinGeckoId: 'wrapped-bitcoin',
      },
      {
        coinDenom: 'LINK',
        coinMinimalDenom: 'link-wei',
        coinDecimals: 18,
        coinGeckoId: 'chainlink',
      },
      {
        coinDenom: 'AAVE',
        coinMinimalDenom: 'aave-wei',
        coinDecimals: 18,
        coinGeckoId: 'aave',
      },
      {
        coinDenom: 'APE',
        coinMinimalDenom: 'ape-wei',
        coinDecimals: 18,
        coinGeckoId: 'apecoin',
      },
      {
        coinDenom: 'AXS',
        coinMinimalDenom: 'axs-wei',
        coinDecimals: 18,
        coinGeckoId: 'axie-infinity',
      },
      {
        coinDenom: 'MKR',
        coinMinimalDenom: 'mkr-wei',
        coinDecimals: 18,
        coinGeckoId: 'maker',
      },
      {
        coinDenom: 'RAI',
        coinMinimalDenom: 'rai-wei',
        coinDecimals: 18,
        coinGeckoId: 'rai',
      },
      {
        coinDenom: 'SHIB',
        coinMinimalDenom: 'shib-wei',
        coinDecimals: 18,
        coinGeckoId: 'shiba-inu',
      },
      {
        coinDenom: 'stETH',
        coinMinimalDenom: 'steth-wei',
        coinDecimals: 18,
        coinGeckoId: 'staked-ether',
      },
      {
        coinDenom: 'UNI',
        coinMinimalDenom: 'uni-wei',
        coinDecimals: 18,
        coinGeckoId: 'uniswap',
      },
      {
        coinDenom: 'XCN',
        coinMinimalDenom: 'xcn-wei',
        coinDecimals: 18,
        coinGeckoId: 'chain-2',
      },
      {
        coinDenom: 'WGLMR',
        coinMinimalDenom: 'wglmr-wei',
        coinDecimals: 18,
        coinGeckoId: 'wrapped-moonbeam',
      },
      {
        coinDenom: 'DOT',
        coinMinimalDenom: 'dot-planck',
        coinDecimals: 10,
        coinGeckoId: 'polkadot',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'AXL',
        coinMinimalDenom: 'uaxl',
        coinDecimals: 6,
        coinGeckoId: 'axelar',
        gasPriceStep: {
          low: 0.007,
          average: 0.007,
          high: 0.01,
        },
      },
    ],
    features: ['ibc-transfer', 'ibc-go', 'axelar-evm-bridge'],
  },
  {
    rpc: 'https://rpc-sommelier.keplr.app',
    rest: 'https://lcd-sommelier.keplr.app',
    chainId: 'sommelier-3',
    chainName: 'Sommelier',
    stakeCurrency: {
      coinDenom: 'SOMM',
      coinMinimalDenom: 'usomm',
      coinDecimals: 6,
      coinGeckoId: 'sommelier',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/sommelier'
        : 'http://localhost:8080/chains/sommelier',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/sommelier'
        : 'http://localhost:8080/chains/sommelier',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('somm'),
    currencies: [
      {
        coinDenom: 'SOMM',
        coinMinimalDenom: 'usomm',
        coinDecimals: 6,
        coinGeckoId: 'sommelier',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'SOMM',
        coinMinimalDenom: 'usomm',
        coinDecimals: 6,
        coinGeckoId: 'sommelier',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
  },
  {
    rpc: 'https://rpc-umee.keplr.app',
    rest: 'https://lcd-umee.keplr.app',
    chainId: 'umee-1',
    chainName: 'Umee',
    stakeCurrency: {
      coinDenom: 'UMEE',
      coinMinimalDenom: 'uumee',
      coinDecimals: 6,
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/umee'
        : 'http://localhost:8080/chains/umee',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/umee'
        : 'http://localhost:8080/chains/umee',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('umee'),
    currencies: [
      {
        coinDenom: 'UMEE',
        coinMinimalDenom: 'uumee',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'UMEE',
        coinMinimalDenom: 'uumee',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.05,
          average: 0.06,
          high: 0.1,
        },
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
  },
  {
    rpc: 'https://rpc-stride.keplr.app',
    rest: 'https://lcd-stride.keplr.app',
    chainId: 'stride-1',
    chainName: 'Stride',
    stakeCurrency: {
      coinDenom: 'STRD',
      coinMinimalDenom: 'ustrd',
      coinDecimals: 6,
      coinGeckoId: 'stride',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/stride'
        : 'http://localhost:8080/chains/stride',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/stride'
        : 'http://localhost:8080/chains/stride',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('stride'),
    currencies: [
      {
        coinDenom: 'STRD',
        coinMinimalDenom: 'ustrd',
        coinDecimals: 6,
        coinGeckoId: 'stride',
      },
      {
        coinDenom: 'stATOM',
        coinMinimalDenom: 'stuatom',
        coinDecimals: 6,
      },
      {
        coinDenom: 'stOSMO',
        coinMinimalDenom: 'stuosmo',
        coinDecimals: 6,
      },
      {
        coinDenom: 'stJUNO',
        coinMinimalDenom: 'stujuno',
        coinDecimals: 6,
      },
      {
        coinDenom: 'stSTARS',
        coinMinimalDenom: 'stustars',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'STRD',
        coinMinimalDenom: 'ustrd',
        coinDecimals: 6,
        coinGeckoId: 'stride',
        gasPriceStep: {
          low: 0,
          average: 0,
          high: 0.04,
        },
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
  },
  {
    rpc: 'https://rpc-evmos.keplr.app',
    rest: 'https://lcd-evmos.keplr.app',
    chainId: 'evmos_9001-2',
    chainName: 'Evmos',
    stakeCurrency: {
      coinDenom: 'EVMOS',
      coinMinimalDenom: 'aevmos',
      coinDecimals: 18,
      coinGeckoId: 'evmos',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/evmos'
        : 'http://localhost:8080/chains/evmos',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/evmos'
        : 'http://localhost:8080/chains/evmos',
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    currencies: [
      {
        coinDenom: 'EVMOS',
        coinMinimalDenom: 'aevmos',
        coinDecimals: 18,
        coinGeckoId: 'evmos',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'EVMOS',
        coinMinimalDenom: 'aevmos',
        coinDecimals: 18,
        coinGeckoId: 'evmos',
        gasPriceStep: {
          low: 25000000000,
          average: 25000000000,
          high: 40000000000,
        },
      },
    ],
    features: ['ibc-transfer', 'ibc-go', 'eth-address-gen', 'eth-key-sign'],
  },
  {
    rpc: 'https://rpc-injective.keplr.app',
    rest: 'https://lcd-injective.keplr.app',
    chainId: 'injective-1',
    chainName: 'Injective',
    stakeCurrency: {
      coinDenom: 'INJ',
      coinMinimalDenom: 'inj',
      coinDecimals: 18,
      coinGeckoId: 'injective-protocol',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/injective'
        : 'http://localhost:8080/chains/injective',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/injective'
        : 'http://localhost:8080/chains/injective',
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config('inj'),
    currencies: [
      {
        coinDenom: 'INJ',
        coinMinimalDenom: 'inj',
        coinDecimals: 18,
        coinGeckoId: 'injective-protocol',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'INJ',
        coinMinimalDenom: 'inj',
        coinDecimals: 18,
        coinGeckoId: 'injective-protocol',
        gasPriceStep: {
          low: 5000000000,
          average: 25000000000,
          high: 50000000000,
        },
      },
    ],
    features: ['ibc-transfer', 'ibc-go', 'eth-address-gen', 'eth-key-sign'],
  },
  {
    rpc: 'https://rpc-kava.keplr.app',
    rest: 'https://lcd-kava.keplr.app',
    chainId: 'kava_2222-10',
    chainName: 'Kava',
    stakeCurrency: {
      coinDenom: 'KAVA',
      coinMinimalDenom: 'ukava',
      coinDecimals: 6,
      coinGeckoId: 'kava',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/kava'
        : 'http://localhost:8080/chains/kava',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/kava'
        : 'http://localhost:8080/chains/kava',
    bip44: {coinType: 459},
    alternativeBIP44s: [{coinType: 118}],
    bech32Config: Bech32Address.defaultBech32Config('kava'),
    currencies: [
      {
        coinDenom: 'KAVA',
        coinMinimalDenom: 'ukava',
        coinDecimals: 6,
        coinGeckoId: 'kava',
      },
      {
        coinDenom: 'SWP',
        coinMinimalDenom: 'swp',
        coinDecimals: 6,
        coinGeckoId: 'kava-swap',
      },
      {
        coinDenom: 'USDX',
        coinMinimalDenom: 'usdx',
        coinDecimals: 6,
        coinGeckoId: 'usdx',
      },
      {
        coinDenom: 'HARD',
        coinMinimalDenom: 'hard',
        coinDecimals: 6,
      },
      {
        coinDenom: 'BNB',
        coinMinimalDenom: 'bnb',
        coinDecimals: 8,
      },
      {
        coinDenom: 'BTCB',
        coinMinimalDenom: 'btcb',
        coinDecimals: 8,
      },
      {
        coinDenom: 'BUSD',
        coinMinimalDenom: 'busd',
        coinDecimals: 8,
      },
      {
        coinDenom: 'XRPB',
        coinMinimalDenom: 'xrpb',
        coinDecimals: 8,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'KAVA',
        coinMinimalDenom: 'ukava',
        coinDecimals: 6,
        coinGeckoId: 'kava',
        gasPriceStep: {
          low: 0.05,
          average: 0.1,
          high: 0.25,
        },
      },
    ],
  },
  {
    rpc: 'https://rpc-quicksilver.keplr.app',
    rest: 'https://lcd-quicksilver.keplr.app',
    chainId: 'quicksilver-1',
    chainName: 'Quicksilver',
    stakeCurrency: {
      coinDenom: 'QCK',
      coinMinimalDenom: 'uqck',
      coinDecimals: 6,
    },
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/quicksilver'
        : 'http://localhost:8080/chains/quicksilver',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'quick',
      bech32PrefixAccPub: 'quickpub',
      bech32PrefixValAddr: 'quickvaloper',
      bech32PrefixValPub: 'quickvaloperpub',
      bech32PrefixConsAddr: 'quickvalcons',
      bech32PrefixConsPub: 'quickvalconspub',
    },
    currencies: [
      {
        coinDenom: 'QCK',
        coinMinimalDenom: 'uqck',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'QCK',
        coinMinimalDenom: 'uqck',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0,
          average: 0.0001,
          high: 0.00025,
        },
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-phoenix.keplr.app',
    rest: 'https://lcd-phoenix.keplr.app',
    chainId: 'phoenix-1',
    chainName: 'Terra',
    stakeCurrency: {
      coinDenom: 'LUNA',
      coinMinimalDenom: 'uluna',
      coinDecimals: 6,
      coinGeckoId: 'terra-luna-2',
    },
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/chains/terra'
        : 'http://localhost:8080/chains/terra',
    bip44: {
      coinType: 330,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'terra',
      bech32PrefixAccPub: 'terrapub',
      bech32PrefixValAddr: 'terravaloper',
      bech32PrefixValPub: 'terravaloperpub',
      bech32PrefixConsAddr: 'terravalcons',
      bech32PrefixConsPub: 'terravalconspub',
    },
    currencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna-2',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna-2',
        gasPriceStep: {
          low: 0.15,
          average: 0.25,
          high: 0.4,
        },
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-columbus.keplr.app',
    rest: 'https://lcd-columbus.keplr.app',
    chainId: 'columbus-5',
    chainName: 'Terra Classic',
    stakeCurrency: {
      coinDenom: 'LUNC',
      coinMinimalDenom: 'uluna',
      coinDecimals: 6,
      coinGeckoId: 'terra-luna',
    },
    bip44: {
      coinType: 330,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'terra',
      bech32PrefixAccPub: 'terrapub',
      bech32PrefixValAddr: 'terravaloper',
      bech32PrefixValPub: 'terravaloperpub',
      bech32PrefixConsAddr: 'terravalcons',
      bech32PrefixConsPub: 'terravalconspub',
    },
    currencies: [
      {
        coinDenom: 'LUNC',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna',
      },
      {
        coinDenom: 'USTC',
        coinMinimalDenom: 'uusd',
        coinDecimals: 6,
        coinGeckoId: 'terrausd',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LUNC',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna',
        gasPriceStep: {
          low: 28.325,
          average: 28.325,
          high: 28.325,
        },
      },
      {
        coinDenom: 'USTC',
        coinMinimalDenom: 'uusd',
        coinDecimals: 6,
        coinGeckoId: 'terrausd',
        gasPriceStep: {
          low: 0.75,
          average: 0.75,
          high: 0.75,
        },
      },
    ],
    features: ['terra-classic-fee'],
  },
  {
    rpc: 'https://rpc-quasar.keplr.app',
    rest: 'https://lcd-quasar.keplr.app',
    chainId: 'quasar-1',
    chainName: 'Quasar',
    stakeCurrency: {
      coinDenom: 'QSR',
      coinMinimalDenom: 'uqsr',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'quasar',
      bech32PrefixAccPub: 'quasarpub',
      bech32PrefixValAddr: 'quasarvaloper',
      bech32PrefixValPub: 'quasarvaloperpub',
      bech32PrefixConsAddr: 'quasarvalcons',
      bech32PrefixConsPub: 'quasarvalconspub',
    },
    currencies: [
      {
        coinDenom: 'QSR',
        coinMinimalDenom: 'uqsr',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom:
          'ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.01,
          high: 0.02,
        },
      },
      {
        coinDenom: 'ATOM',
        coinMinimalDenom:
          'ibc/FA0006F056DB6719B8C16C551FC392B62F5729978FC0B125AC9A432DBB2AA1A5',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.01,
          high: 0.02,
        },
      },
      {
        coinDenom: 'USDC',
        coinMinimalDenom:
          'ibc/FA7775734CC73176B7425910DE001A1D2AD9B6D9E93129A5D0750EAD13E4E63A',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.01,
          high: 0.02,
        },
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-noble.keplr.app',
    rest: 'https://lcd-noble.keplr.app',
    chainId: 'noble-1',
    chainName: 'Noble',
    stakeCurrency: {
      coinDenom: 'STAKE',
      coinMinimalDenom: 'ustake',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'noble',
      bech32PrefixAccPub: 'noblepub',
      bech32PrefixValAddr: 'noblevaloper',
      bech32PrefixValPub: 'noblevaloperpub',
      bech32PrefixConsAddr: 'noblevalcons',
      bech32PrefixConsPub: 'noblevalconspub',
    },
    currencies: [
      {
        coinDenom: 'STAKE',
        coinMinimalDenom: 'ustake',
        coinDecimals: 6,
      },
      {
        coinDenom: 'USDC',
        coinMinimalDenom: 'uusdc',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'USDC',
        coinMinimalDenom: 'uusdc',
        coinDecimals: 6,
      },
      {
        coinDenom: 'ATOM',
        coinMinimalDenom:
          'ibc/EF48E6B1A1A19F47ECAEA62F5670C37C0580E86A9E88498B7E393EB6F49F33C0',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.001,
          average: 0.001,
          high: 0.001,
        },
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-omniflixhub.keplr.app',
    rest: 'https://lcd-omniflixhub.keplr.app',
    chainId: 'omniflixhub-1',
    chainName: 'OmniFlix',
    stakeCurrency: {
      coinDenom: 'FLIX',
      coinMinimalDenom: 'uflix',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'omniflix',
      bech32PrefixAccPub: 'omniflixpub',
      bech32PrefixValAddr: 'omniflixvaloper',
      bech32PrefixValPub: 'omniflixvaloperpub',
      bech32PrefixConsAddr: 'omniflixvalcons',
      bech32PrefixConsPub: 'omniflixvalconspub',
    },
    currencies: [
      {
        coinDenom: 'FLIX',
        coinMinimalDenom: 'uflix',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'FLIX',
        coinMinimalDenom: 'uflix',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.001,
          average: 0.0025,
          high: 0.025,
        },
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-kyve.keplr.app',
    rest: 'https://lcd-kyve.keplr.app',
    chainId: 'kyve-1',
    chainName: 'KYVE',
    stakeCurrency: {
      coinDenom: 'KYVE',
      coinMinimalDenom: 'ukyve',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'kyve',
      bech32PrefixAccPub: 'kyvepub',
      bech32PrefixValAddr: 'kyvevaloper',
      bech32PrefixValPub: 'kyvevaloperpub',
      bech32PrefixConsAddr: 'kyvevalcons',
      bech32PrefixConsPub: 'kyvevalconspub',
    },
    currencies: [
      {
        coinDenom: 'KYVE',
        coinMinimalDenom: 'ukyve',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'KYVE',
        coinMinimalDenom: 'ukyve',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.02,
          average: 0.03,
          high: 0.06,
        },
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-neutron.keplr.app',
    rest: 'https://lcd-neutron.keplr.app',
    chainId: 'neutron-1',
    chainName: 'Neutron',
    stakeCurrency: {
      coinDenom: 'STAKE',
      coinMinimalDenom: 'ustake',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'neutron',
      bech32PrefixAccPub: 'neutronpub',
      bech32PrefixValAddr: 'neutronvaloper',
      bech32PrefixValPub: 'neutronvaloperpub',
      bech32PrefixConsAddr: 'neutronvalcons',
      bech32PrefixConsPub: 'neutronvalconspub',
    },
    currencies: [
      {
        coinDenom: 'NTRN',
        coinMinimalDenom: 'untrn',
        coinDecimals: 6,
      },
      {
        coinDenom: 'STAKE',
        coinMinimalDenom: 'ustake',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'NTRN',
        coinMinimalDenom: 'untrn',
        coinDecimals: 6,
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-likecoin.keplr.app',
    rest: 'https://lcd-likecoin.keplr.app',
    chainId: 'likecoin-mainnet-2',
    chainName: 'Likecoin',
    stakeCurrency: {
      coinDenom: 'LIKE',
      coinMinimalDenom: 'nanolike',
      coinDecimals: 9,
      coinGeckoId: 'likecoin',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'like',
      bech32PrefixAccPub: 'likepub',
      bech32PrefixValAddr: 'likevaloper',
      bech32PrefixValPub: 'likevaloperpub',
      bech32PrefixConsAddr: 'likevalcons',
      bech32PrefixConsPub: 'likevalconspub',
    },
    currencies: [
      {
        coinDenom: 'LIKE',
        coinMinimalDenom: 'nanolike',
        coinDecimals: 9,
        coinGeckoId: 'likecoin',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LIKE',
        coinMinimalDenom: 'nanolike',
        coinDecimals: 9,
        coinGeckoId: 'likecoin',
        gasPriceStep: {
          low: 1,
          average: 2,
          high: 3,
        },
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-dydx.keplr.app',
    rest: 'https://lcd-dydx.keplr.app',
    chainId: 'dydx-mainnet-1',
    chainName: 'dYdX',
    stakeCurrency: {
      coinDenom: 'DYDX',
      coinDecimals: 18,
      coinMinimalDenom: 'adydx',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'dydx',
      bech32PrefixAccPub: 'dydxpub',
      bech32PrefixValAddr: 'dydxvaloper',
      bech32PrefixValPub: 'dydxvaloperpub',
      bech32PrefixConsAddr: 'dydxvalcons',
      bech32PrefixConsPub: 'dydxvalconspub',
    },
    currencies: [
      {
        coinDenom: 'DYDX',
        coinDecimals: 18,
        coinMinimalDenom: 'adydx',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'DYDX',
        coinDecimals: 18,
        coinMinimalDenom: 'adydx',
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-celestia.keplr.app',
    rest: 'https://lcd-celestia.keplr.app',
    chainId: 'celestia',
    chainName: 'Celestia',
    stakeCurrency: {
      coinDenom: 'TIA',
      coinDecimals: 6,
      coinMinimalDenom: 'utia',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('celestia'),
    currencies: [
      {
        coinDenom: 'TIA',
        coinDecimals: 6,
        coinMinimalDenom: 'utia',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'TIA',
        coinDecimals: 6,
        coinMinimalDenom: 'utia',
      },
    ],
    features: [],
  },
  {
    rpc: 'https://rpc-passage.keplr.app',
    rest: 'https://lcd-passage.keplr.app',
    chainId: 'passage-2',
    chainName: 'Passage',
    stakeCurrency: {
      coinDenom: 'PASG',
      coinMinimalDenom: 'upasg',
      coinDecimals: 6,
      coinGeckoId: 'passage',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('pasg'),
    currencies: [
      {
        coinDenom: 'PASG',
        coinMinimalDenom: 'upasg',
        coinDecimals: 6,
        coinGeckoId: 'passage',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'PASG',
        coinMinimalDenom: 'upasg',
        coinDecimals: 6,
        coinGeckoId: 'passage',
      },
    ],
    features: ['cosmwasm'],
  },
  {
    chainId: 'dymension_1100-1',
    chainName: 'Dymension',
    rpc: 'https://rpc-dymension.keplr.app',
    rest: 'https://lcd-dymension.keplr.app',
    currencies: [
      {
        coinMinimalDenom: 'adym',
        coinDenom: 'DYM',
        coinDecimals: 18,
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/dymension_1100/chain.png',
      },
    ],
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'dym',
      bech32PrefixAccPub: 'dympub',
      bech32PrefixValAddr: 'dymvaloper',
      bech32PrefixValPub: 'dymvaloperpub',
      bech32PrefixConsAddr: 'dymvalcons',
      bech32PrefixConsPub: 'dymvalconspub',
    },
    stakeCurrency: {
      coinMinimalDenom: 'adym',
      coinDenom: 'DYM',
      coinDecimals: 18,
    },
    feeCurrencies: [
      {
        coinMinimalDenom: 'adym',
        coinDenom: 'DYM',
        coinDecimals: 18,
        gasPriceStep: {
          average: 20000000000,
          high: 20000000000,
          low: 20000000000,
        },
      },
    ],
    features: ['eth-address-gen', 'eth-key-sign'],
  },
  {
    chainId: 'chihuahua-1',
    chainName: 'Chihuahua',
    chainSymbolImageUrl:
      'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/chain.png',
    rpc: 'https://rpc-chihuahua.keplr.app',
    rest: 'https://lcd-chihuahua.keplr.app',
    stakeCurrency: {
      coinDenom: 'HUAHUA',
      coinMinimalDenom: 'uhuahua',
      coinDecimals: 6,
      coinGeckoId: 'chihuahua-token',
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/chain.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'chihuahua',
      bech32PrefixAccPub: 'chihuahuapub',
      bech32PrefixValAddr: 'chihuahuavaloper',
      bech32PrefixValPub: 'chihuahuavaloperpub',
      bech32PrefixConsAddr: 'chihuahuavalcons',
      bech32PrefixConsPub: 'chihuahuavalconspub',
    },
    currencies: [
      {
        coinDenom: 'HUAHUA',
        coinMinimalDenom: 'uhuahua',
        coinDecimals: 6,
        coinGeckoId: 'chihuahua-token',
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/chain.png',
      },
      {
        coinDenom: 'BADDOG',
        coinMinimalDenom:
          'factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat',
        coinDecimals: 6,
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat.png',
      },
      {
        coinDenom: 'WOOF',
        coinMinimalDenom:
          'factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof',
        coinDecimals: 6,
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/woof.png',
      },
      {
        coinDenom: 'TACOS',
        coinMinimalDenom:
          'factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/utacos',
        coinDecimals: 6,
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/tacos.png',
      },
      {
        coinDenom: 'WEED',
        coinMinimalDenom:
          'factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uweed',
        coinDecimals: 6,
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/weed.png',
      },
      {
        coinDenom: 'BDOG',
        coinMinimalDenom:
          'factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/ubdog',
        coinDecimals: 6,
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/bdog.png',
      },
      {
        coinDenom: 'CORSO',
        coinMinimalDenom:
          'factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/ucorso',
        coinDecimals: 6,
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/corso.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'HUAHUA',
        coinMinimalDenom: 'uhuahua',
        coinDecimals: 6,
        coinGeckoId: 'chihuahua-token',
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/chihuahua/chain.png',
        gasPriceStep: {
          low: 500,
          average: 1250,
          high: 2000,
        },
      },
    ],
    features: ['cosmwasm'],
    walletUrlForStaking: 'https://wallet.keplr.app/chains/chihuahua',
  },
  {
    chainId: 'ssc-1',
    chainName: 'Saga',
    rpc: 'https://rpc-saga.keplr.app',
    rest: 'https://lcd-saga.keplr.app',
    stakeCurrency: {
      coinDenom: 'SAGA',
      coinMinimalDenom: 'usaga',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'saga',
      bech32PrefixAccPub: 'sagapub',
      bech32PrefixValAddr: 'sagavaloper',
      bech32PrefixValPub: 'sagavaloperpub',
      bech32PrefixConsAddr: 'sagavalcons',
      bech32PrefixConsPub: 'sagavalconspub',
    },
    currencies: [
      {
        coinDenom: 'SAGA',
        coinMinimalDenom: 'usaga',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'SAGA',
        coinMinimalDenom: 'usaga',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
  },
  {
    chainId: 'seda-1',
    chainName: 'SEDA',
    rpc: 'https://rpc-seda.keplr.app',
    rest: 'https://lcd-seda.keplr.app',
    stakeCurrency: {
      coinDenom: 'SEDA',
      coinMinimalDenom: 'aseda',
      coinDecimals: 18,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'seda',
      bech32PrefixAccPub: 'sedapub',
      bech32PrefixValAddr: 'sedavaloper',
      bech32PrefixValPub: 'sedavaloperpub',
      bech32PrefixConsAddr: 'sedavalcons',
      bech32PrefixConsPub: 'sedavalconspub',
    },
    currencies: [
      {
        coinDenom: 'SEDA',
        coinMinimalDenom: 'aseda',
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'SEDA',
        coinMinimalDenom: 'aseda',
        coinDecimals: 18,
        gasPriceStep: {
          low: 10000000000,
          average: 15000000000,
          high: 20000000000,
        },
      },
    ],
    features: ['cosmwasm'],
  },
  {
    rpc: 'https://rpc-dimension.keplr.app',
    rest: 'https://lcd-dimension.keplr.app',
    chainId: 'dimension_37-1',
    chainName: 'XPLA',
    stakeCurrency: {
      coinDenom: 'XPLA',
      coinMinimalDenom: 'axpla',
      coinDecimals: 18,
      coinGeckoId: 'xpla',
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'xpla',
      bech32PrefixAccPub: 'xplapub',
      bech32PrefixValAddr: 'xplavaloper',
      bech32PrefixValPub: 'xplavaloperpub',
      bech32PrefixConsAddr: 'xplavalcons',
      bech32PrefixConsPub: 'xplavalconspub',
    },
    currencies: [
      {
        coinDenom: 'XPLA',
        coinMinimalDenom: 'axpla',
        coinDecimals: 18,
        coinGeckoId: 'xpla',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'XPLA',
        coinMinimalDenom: 'axpla',
        coinDecimals: 18,
        coinGeckoId: 'xpla',
        gasPriceStep: {
          low: 850000000000,
          average: 1147500000000,
          high: 1487500000000,
        },
      },
    ],
    features: ['eth-address-gen', 'eth-key-sign', 'cosmwasm'],
  },
  {
    rpc: 'https://rpc-pryzm.keplr.app',
    rest: 'https://lcd-pryzm.keplr.app',
    chainId: 'pryzm-1',
    chainName: 'Pryzm',
    stakeCurrency: {
      coinDenom: 'PRYZM',
      coinMinimalDenom: 'upryzm',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'pryzm',
      bech32PrefixAccPub: 'pryzmpub',
      bech32PrefixValAddr: 'pryzmvaloper',
      bech32PrefixValPub: 'pryzmvaloperpub',
      bech32PrefixConsAddr: 'pryzmvalcons',
      bech32PrefixConsPub: 'pryzmvalconspub',
    },
    currencies: [
      {
        coinDenom: 'PRYZM',
        coinMinimalDenom: 'upryzm',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'PRYZM',
        coinMinimalDenom: 'upryzm',
        coinDecimals: 6,
      },
    ],
    features: ['cosmwasm'],
  },
  {
    rpc: 'https://rpc-zetachain.keplr.app',
    rest: 'https://lcd-zetachain.keplr.app',
    chainId: 'zetachain_7000-1',
    chainName: 'ZetaChain',
    stakeCurrency: {
      coinDenom: 'ZETA',
      coinMinimalDenom: 'azeta',
      coinDecimals: 18,
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'zeta',
      bech32PrefixAccPub: 'zetapub',
      bech32PrefixValAddr: 'zetavaloper',
      bech32PrefixValPub: 'zetavaloperpub',
      bech32PrefixConsAddr: 'ezetaalcons',
      bech32PrefixConsPub: 'zetavalconspub',
    },
    currencies: [
      {
        coinDenom: 'ZETA',
        coinMinimalDenom: 'azeta',
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'ZETA',
        coinMinimalDenom: 'azeta',
        coinDecimals: 18,
        gasPriceStep: {
          low: 80000000000,
          average: 80000000000,
          high: 80000000000,
        },
      },
    ],
    features: ['eth-address-gen', 'eth-key-sign'],
  },
  {
    rpc: 'https://rpc-lava.keplr.app',
    rest: 'https://lcd-lava.keplr.app',
    chainId: 'lava-mainnet-1',
    chainName: 'Lava',
    stakeCurrency: {
      coinDenom: 'LAVA',
      coinMinimalDenom: 'ulava',
      coinDecimals: 6,
      coinGeckoId: 'lava-network',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'lava@',
      bech32PrefixAccPub: 'lava@pub',
      bech32PrefixValAddr: 'lava@valoper',
      bech32PrefixValPub: 'lava@valoperpub',
      bech32PrefixConsAddr: 'lava@valcons',
      bech32PrefixConsPub: 'lava@valconspub',
    },
    currencies: [
      {
        coinDenom: 'LAVA',
        coinMinimalDenom: 'ulava',
        coinDecimals: 6,
        coinGeckoId: 'lava-network',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LAVA',
        coinMinimalDenom: 'ulava',
        coinDecimals: 6,
        coinGeckoId: 'lava-network',
        gasPriceStep: {
          low: 0.00002,
          average: 0.025,
          high: 0.05,
        },
      },
    ],
    features: [],
  },
  {
    chainId: 'mantra-1',
    chainName: 'MANTRA',
    chainSymbolImageUrl:
      'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mantra/chain.png',
    rpc: 'https://rpc-mantra.keplr.app',
    rest: 'https://lcd-mantra.keplr.app',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'mantra',
      bech32PrefixAccPub: 'mantrapub',
      bech32PrefixValAddr: 'mantravaloper',
      bech32PrefixValPub: 'mantravaloperpub',
      bech32PrefixConsAddr: 'mantravalcons',
      bech32PrefixConsPub: 'mantravalconspub',
    },
    currencies: [
      {
        coinDenom: 'OM',
        coinMinimalDenom: 'uom',
        coinDecimals: 6,
        coinGeckoId: 'mantra-dao',
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mantra/om.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'OM',
        coinMinimalDenom: 'uom',
        coinDecimals: 6,
        coinGeckoId: 'mantra-dao',
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mantra/om.png',
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: 'OM',
      coinMinimalDenom: 'uom',
      coinDecimals: 6,
      coinGeckoId: 'mantra-dao',
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mantra/om.png',
    },
    features: ['cosmwasm'],
  },
  {
    rpc: 'https://rpc-pirin.keplr.app',
    rest: 'https://lcd-pirin.keplr.app',
    chainId: 'pirin-1',
    chainName: 'Nolus',
    chainSymbolImageUrl:
      'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pirin/nolus.png',
    stakeCurrency: {
      coinDenom: 'NLS',
      coinMinimalDenom: 'unls',
      coinDecimals: 6,
      coinGeckoId: 'nolus',
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pirin/nolus.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'nolus',
      bech32PrefixAccPub: 'noluspub',
      bech32PrefixValAddr: 'nolusvaloper',
      bech32PrefixValPub: 'nolusvaloperpub',
      bech32PrefixConsAddr: 'nolusvalcons',
      bech32PrefixConsPub: 'nolusvalconspub',
    },
    currencies: [
      {
        coinDenom: 'NLS',
        coinMinimalDenom: 'unls',
        coinDecimals: 6,
        coinGeckoId: 'nolus',
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pirin/nolus.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'NLS',
        coinMinimalDenom: 'unls',
        coinDecimals: 6,
        coinGeckoId: 'nolus',
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pirin/nolus.png',
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.05,
        },
      },
    ],
    features: ['cosmwasm'],
  },
  {
    rpc: 'https://rpc-xion.keplr.app',
    rest: 'https://lcd-xion.keplr.app',
    chainId: 'xion-mainnet-1',
    chainName: 'Xion',
    chainSymbolImageUrl:
      'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png',
    walletUrlForStaking: 'https://wallet.keplr.app/chains/xion',
    stakeCurrency: {
      coinDenom: 'XION',
      coinMinimalDenom: 'uxion',
      coinDecimals: 6,
      coinGeckoId: 'xion-2',
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'xion',
      bech32PrefixAccPub: 'xionpub',
      bech32PrefixValAddr: 'xionvaloper',
      bech32PrefixValPub: 'xionvaloperpub',
      bech32PrefixConsAddr: 'xionvalcons',
      bech32PrefixConsPub: 'xionvalconspub',
    },
    currencies: [
      {
        coinDenom: 'XION',
        coinMinimalDenom: 'uxion',
        coinDecimals: 6,
        coinGeckoId: 'xion-2',
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'XION',
        coinMinimalDenom: 'uxion',
        coinDecimals: 6,
        coinGeckoId: 'xion-2',
        coinImageUrl:
          'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png',
        gasPriceStep: {
          low: 0.0005,
          average: 0.001,
          high: 0.002,
        },
      },
    ],
    features: ['cosmwasm'],
  },
];

// TODO: 원격으로 변경할 수 있도록 나중에 네트워크에서 이 정보를 가져오는 방식으로 변경될 수 있음
export const ChainIdentifierToTxExplorerMap: Record<
  string,
  {name: string; txUrl: string} | undefined
> = {
  cosmoshub: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/cosmos/tx/{txHash}',
  },
  osmosis: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/osmosis/tx/{txHash}',
  },
  secret: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/secret/tx/{txHash}',
  },
  akashnet: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/akash/tx/{txHash}',
  },
  mars: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/mars-protocol/txs/{txHash}',
  },
  'crypto-org-chain-mainnet': {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/crypto-org/tx/{txHash}',
  },
  'shentu-2.2': {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/shentu/tx/{txHash}',
  },
  irishub: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/iris/tx/{txHash}',
  },
  regen: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/regen/tx/{txHash}',
  },
  core: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/persistence/tx/{txHash}',
  },
  sentinelhub: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/sentinel/tx/{txHash}',
  },
  juno: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/juno/tx/{txHash}',
  },
  stargaze: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/stargaze/tx/{txHash}',
  },
  'axelar-dojo': {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/axelar/tx/{txHash}',
  },
  sommelier: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/sommelier/tx/{txHash}',
  },
  umee: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/umee/tx/{txHash}',
  },
  'gravity-bridge': {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/gravity-bridge/tx/{txHash}',
  },
  'tgrade-mainnet': {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/tgrade/tx/{txHash}',
  },
  stride: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/stride/tx/{txHash}',
  },
  evmos_9001: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/evmos/tx/{txHash}',
  },
  injective: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/injective/tx/{txHash}',
  },
  kava_2222: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/kava/tx/{txHash}',
  },
  quicksilver: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/quicksilver/tx/{txHash}',
  },
  phoenix: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/terra/tx/{txHash}',
  },
  quasar: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/quasar/tx/{txHash}',
  },
  noble: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/noble/tx/{txHash}',
  },
  omniflixhub: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/omniflix/tx/{txHash}',
  },
  kyve: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/kyve/tx/{txHash}',
  },
  neutron: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/neutron/tx/{txHash}',
  },
  'likecoin-mainnet': {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/likecoin/tx/{txHash}',
  },
  passage: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/passage/tx/{txHash}',
  },
  dymension_1100: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/dymension/tx/{txHash}',
  },
  chihuahua: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/chihuahua/tx/{txHash}',
  },
  dimension_37: {
    name: 'Mintscan',
    txUrl: 'https://www.mintscan.io/xpla/tx/{txHash}',
  },
  pirin: {
    name: 'Nolus Explorer',
    txUrl: 'https://explorer.nolus.io/pirin/tx/{txHash}',
  },
};

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = [
  'https://wallet.keplr.app',
  'https://validator.keplr.app',
  'https://chains.keplr.app',
];

export const CommunityChainInfoRepo = {
  organizationName: 'chainapsis',
  repoName: 'keplr-chain-registry',
  branchName: 'main',
  alternativeURL: process.env['KEPLR_EXT_CHAIN_REGISTRY_URL']
    ? process.env['KEPLR_EXT_CHAIN_REGISTRY_URL']
    : undefined,
};

export const APR_API_URL =
  'https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws';

export const SCAMPORPOSAL_API_URL =
  'https://phishing-block-list-chainapsis.vercel.app';

export const COMMUNITY_CHAIN_URL = 'https://chains.keplr.app';

export const APP_STORE_URL = 'https://itunes.apple.com';
export const PLAY_STORE_URL = 'https://play.google.com';

export const GovernanceV1ChainIdentifiers = [
  'kyve',
  'mars',
  'juno',
  'kava_2222',
  'evmos_9001',
  'injective',
  'quicksilver',
  'gitopia',
  'core',
  'celestia',
  'dydx-mainnet',
  'likecoin-mainnet',
  'osmosis',
];

export const NoDashboardLinkIdentifiers = ['tgrade-mainnet', 'emoney'];
export const DASHBOARD_URL = 'https://wallet.keplr.app';
