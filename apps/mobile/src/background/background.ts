import {BACKGROUND_PORT} from '@keplr-wallet/router';
import {init} from '@keplr-wallet/background';
import scrypt from 'scrypt-js';
import {Buffer} from 'buffer/';
import {
  RNEnv,
  RNMessageRequesterInternalToUI,
  RNRouterBackground,
} from '../router';
import {
  CommunityChainInfoRepo,
  EmbedChainInfos,
  PrivilegedOrigins,
} from '../config';
import {AsyncKVStore} from '../common';
import {Platform} from 'react-native';

const router = new RNRouterBackground(RNEnv.produceEnv);

const {initFn} = init(
  router,
  (prefix: string) => new AsyncKVStore(prefix),
  new RNMessageRequesterInternalToUI(),
  undefined,
  EmbedChainInfos,
  PrivilegedOrigins,
  PrivilegedOrigins,
  PrivilegedOrigins,
  CommunityChainInfoRepo,
  {
    create: (_params: {
      iconRelativeUrl?: string;
      title: string;
      message: string;
    }) => {
      // TODO: or noop
    },
  },
  () => {
    // TODO
  },
  'https://blocklist.keplr.app',
  {
    commonCrypto: {
      scrypt: async (
        text: string,
        params: {dklen: number; salt: string; n: number; r: number; p: number},
      ) => {
        return await scrypt.scrypt(
          Buffer.from(text),
          Buffer.from(params.salt, 'hex'),
          params.n,
          params.r,
          params.p,
          params.dklen,
        );
      },
    },
    getDisabledChainIdentifiers: async () => {
      const kvStore = new AsyncKVStore('store_chains');
      const legacy = await kvStore.get<{disabledChains: string[]}>(
        'chain_info_in_ui_config',
      );
      if (!legacy) {
        return [];
      }
      return legacy.disabledChains ?? [];
    },
  },
  {
    platform: 'mobile',
    mobileOS: Platform.OS,
  },
  true,
  async (chainsService, lastEmbedChainInfos) => {
    try {
      if (lastEmbedChainInfos.find(c => c.chainId === 'gitopia')) {
        await chainsService.addSuggestedChainInfo({
          chainId: 'gitopia',
          chainName: 'Gitopia',
          chainSymbolImageUrl:
            'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gitopia/chain.png',
          rpc: 'https://rpc-gitopia.keplr.app',
          rest: 'https://lcd-gitopia.keplr.app',
          bip44: {
            coinType: 118,
          },
          stakeCurrency: {
            coinDenom: 'LORE',
            coinMinimalDenom: 'ulore',
            coinGeckoId: 'gitopia',
            coinDecimals: 6,
          },
          bech32Config: {
            bech32PrefixAccAddr: 'gitopia',
            bech32PrefixAccPub: 'gitopiapub',
            bech32PrefixValAddr: 'gitopiavaloper',
            bech32PrefixValPub: 'gitopiavaloperpub',
            bech32PrefixConsAddr: 'gitopiavalcons',
            bech32PrefixConsPub: 'gitopiavalconspub',
          },
          currencies: [
            {
              coinDenom: 'LORE',
              coinMinimalDenom: 'ulore',
              coinGeckoId: 'gitopia',
              coinDecimals: 6,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gitopia/chain.png',
            },
          ],
          feeCurrencies: [
            {
              coinDenom: 'LORE',
              coinMinimalDenom: 'ulore',
              coinGeckoId: 'gitopia',
              coinDecimals: 6,
              gasPriceStep: {
                low: 0.0012,
                average: 0.0016,
                high: 0.0024,
              },
            },
          ],
          features: [],
        });
      }

      if (lastEmbedChainInfos.find(c => c.chainId === 'shentu-2.2')) {
        await chainsService.addSuggestedChainInfo({
          rpc: 'https://rpc-certik.keplr.app',
          rest: 'https://lcd-certik.keplr.app',
          chainId: 'shentu-2.2',
          chainName: 'Shentu',
          chainSymbolImageUrl:
            'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/shentu-2.2/chain.png',
          stakeCurrency: {
            coinDenom: 'CTK',
            coinMinimalDenom: 'uctk',
            coinDecimals: 6,
            coinGeckoId: 'certik',
            coinImageUrl:
              'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/shentu-2.2/uctk.png',
          },
          walletUrl: 'https://wallet.keplr.app/chains/shentu',
          walletUrlForStaking: 'https://wallet.keplr.app/chains/shentu',
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: 'shentu',
            bech32PrefixAccPub: 'shentupub',
            bech32PrefixValAddr: 'shentuvaloper',
            bech32PrefixValPub: 'shentuvaloperpub',
            bech32PrefixConsAddr: 'shentuvalcons',
            bech32PrefixConsPub: 'shentuvalconspub',
          },
          currencies: [
            {
              coinDenom: 'CTK',
              coinMinimalDenom: 'uctk',
              coinDecimals: 6,
              coinGeckoId: 'certik',
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/shentu-2.2/uctk.png',
            },
          ],
          feeCurrencies: [
            {
              coinDenom: 'CTK',
              coinMinimalDenom: 'uctk',
              coinDecimals: 6,
              coinGeckoId: 'certik',
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/shentu-2.2/uctk.png',
            },
          ],
          features: [],
        });
      }

      if (lastEmbedChainInfos.find(c => c.chainId === 'sifchain-1')) {
        await chainsService.addSuggestedChainInfo({
          rpc: 'https://rpc-sifchain.keplr.app',
          rest: 'https://lcd-sifchain.keplr.app',
          chainId: 'sifchain-1',
          chainName: 'Sifchain',
          chainSymbolImageUrl:
            'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/sifchain/chain.png',
          stakeCurrency: {
            coinDenom: 'ROWAN',
            coinMinimalDenom: 'rowan',
            coinDecimals: 18,
            coinGeckoId: 'sifchain',
            coinImageUrl:
              'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/sifchain/rowan.png',
          },
          walletUrl: 'https://wallet.keplr.app/chains/sifchain',
          walletUrlForStaking: 'https://wallet.keplr.app/chains/sifchain',
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: 'sif',
            bech32PrefixAccPub: 'sifpub',
            bech32PrefixValAddr: 'sifvaloper',
            bech32PrefixValPub: 'sifvaloperpub',
            bech32PrefixConsAddr: 'sifvalcons',
            bech32PrefixConsPub: 'sifvalconspub',
          },
          currencies: [
            {
              coinDenom: 'ROWAN',
              coinMinimalDenom: 'rowan',
              coinDecimals: 18,
              coinGeckoId: 'sifchain',
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/sifchain/rowan.png',
            },
            {
              coinDenom: 'Tether USDT',
              coinMinimalDenom: 'cusdt',
              coinDecimals: 6,
            },
            {
              coinDenom: 'Ethereum',
              coinMinimalDenom: 'ceth',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Basic Attention Token',
              coinMinimalDenom: 'cbat',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Aragon',
              coinMinimalDenom: 'cant',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Bancor Network Token',
              coinMinimalDenom: 'cbnt',
              coinDecimals: 18,
            },
            {
              coinDenom: '0x',
              coinMinimalDenom: 'czrx',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Chainlink',
              coinMinimalDenom: 'clink',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Decentraland',
              coinMinimalDenom: 'cmana',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Loopring',
              coinMinimalDenom: 'clrc',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Enjin Coin',
              coinMinimalDenom: 'cenj',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Synthetix Network Token',
              coinMinimalDenom: 'csnx',
              coinDecimals: 18,
            },
            {
              coinDenom: 'TrueUSD',
              coinMinimalDenom: 'ctusd',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Ocean Protocol',
              coinMinimalDenom: 'cocean',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Fantom',
              coinMinimalDenom: 'cftm',
              coinDecimals: 18,
            },
            {
              coinDenom: 'sUSD',
              coinMinimalDenom: 'csusd',
              coinDecimals: 18,
            },
            {
              coinDenom: 'USD Coin',
              coinMinimalDenom: 'cusdc',
              coinDecimals: 6,
            },
            {
              coinDenom: 'Crypto com Coin',
              coinMinimalDenom: 'ccro',
              coinDecimals: 8,
            },
            {
              coinDenom: 'Wrapped Bitcoin',
              coinMinimalDenom: 'cwbtc',
              coinDecimals: 8,
            },
            {
              coinDenom: 'Swipe',
              coinMinimalDenom: 'csxp',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Band Protocol',
              coinMinimalDenom: 'cband',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Dai Stablecoin',
              coinMinimalDenom: 'cdai',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Compound',
              coinMinimalDenom: 'ccomp',
              coinDecimals: 18,
            },
            {
              coinDenom: 'UMA',
              coinMinimalDenom: 'cuma',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Balancer',
              coinMinimalDenom: 'cbal',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Yearn finance',
              coinMinimalDenom: 'cyfi',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Serum',
              coinMinimalDenom: 'csrm',
              coinDecimals: 6,
            },
            {
              coinDenom: 'Cream',
              coinMinimalDenom: 'ccream',
              coinDecimals: 18,
            },
            {
              coinDenom: 'SAND',
              coinMinimalDenom: 'csand',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Sushi',
              coinMinimalDenom: 'csushi',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Empty Set Dollar',
              coinMinimalDenom: 'cesd',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Uniswap',
              coinMinimalDenom: 'cuni',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Aave',
              coinMinimalDenom: 'caave',
              coinDecimals: 18,
            },
            {
              coinDenom: 'BarnBridge',
              coinMinimalDenom: 'cbond',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Wrapped Filecoin',
              coinMinimalDenom: 'cwfil',
              coinDecimals: 18,
            },
            {
              coinDenom: 'The Graph',
              coinMinimalDenom: 'cgrt',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Tokenlon',
              coinMinimalDenom: 'clon',
              coinDecimals: 18,
            },
            {
              coinDenom: '1inch',
              coinMinimalDenom: 'c1inch',
              coinDecimals: 18,
            },
            {
              coinDenom: 'THORChain ERC20',
              coinMinimalDenom: 'crune',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Secret ERC20',
              coinMinimalDenom: 'cwscrt',
              coinDecimals: 6,
            },
            {
              coinDenom: 'IoTeX',
              coinMinimalDenom: 'ciotx',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Reef Finance',
              coinMinimalDenom: 'creef',
              coinDecimals: 18,
            },
            {
              coinDenom: 'COCOS BCX',
              coinMinimalDenom: 'ccocos',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Keep Network',
              coinMinimalDenom: 'ckeep',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Origin Protocol',
              coinMinimalDenom: 'cogn',
              coinDecimals: 18,
            },
            {
              coinDenom: 'ODAOfi',
              coinMinimalDenom: 'cdaofi',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Linear',
              coinMinimalDenom: 'clina',
              coinDecimals: 18,
            },
            {
              coinDenom: '12Ships',
              coinMinimalDenom: 'ctshp',
              coinDecimals: 18,
            },
            {
              coinDenom: 'B.20',
              coinMinimalDenom: 'cb20',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Akropolis',
              coinMinimalDenom: 'cakro',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Rio Fuel Token',
              coinMinimalDenom: 'crfuel',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Rally',
              coinMinimalDenom: 'crly',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Convergence',
              coinMinimalDenom: 'cconv',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Render Token',
              coinMinimalDenom: 'crndr',
              coinDecimals: 18,
            },
            {
              coinDenom: 'PAID Network',
              coinMinimalDenom: 'cpaid',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Tidal',
              coinMinimalDenom: 'ctidal',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Axie Infinity',
              coinMinimalDenom: 'caxs',
              coinDecimals: 18,
            },
            {
              coinDenom: 'BitSong',
              coinMinimalDenom: 'cbtsg',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Cosmostarter',
              coinMinimalDenom: 'ccsms',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Dfyn Network',
              coinMinimalDenom: 'cdfyn',
              coinDecimals: 18,
            },
            {
              coinDenom: 'DinoSwap',
              coinMinimalDenom: 'cdino',
              coinDecimals: 18,
            },
            {
              coinDenom: 'DinoX',
              coinMinimalDenom: 'cdnxc',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Don-key',
              coinMinimalDenom: 'cdon',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Ethernity Chain',
              coinMinimalDenom: 'cern',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Frax',
              coinMinimalDenom: 'cfrax',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Frax Share',
              coinMinimalDenom: 'cfxs',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Knit Finance',
              coinMinimalDenom: 'ckft',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Lido DAO',
              coinMinimalDenom: 'cldo',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Doge Killer',
              coinMinimalDenom: 'cleash',
              coinDecimals: 18,
            },
            {
              coinDenom: 'LGCY Network',
              coinMinimalDenom: 'clgcy',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Polygon',
              coinMinimalDenom: 'cmatic',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Metis Token',
              coinMinimalDenom: 'cmetis',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Oh! Finance',
              coinMinimalDenom: 'coh',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Polkastarter',
              coinMinimalDenom: 'cpols',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Marlin',
              coinMinimalDenom: 'cpond',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Quickswap',
              coinMinimalDenom: 'cquick',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Railgun',
              coinMinimalDenom: 'crail',
              coinDecimals: 18,
            },
            {
              coinDenom: 'StaFi rATOM',
              coinMinimalDenom: 'cratom',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Saito',
              coinMinimalDenom: 'csaito',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Shiba Inu',
              coinMinimalDenom: 'cshib',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Tokemak',
              coinMinimalDenom: 'ctoke',
              coinDecimals: 18,
            },
            {
              coinDenom: 'UFO Gaming',
              coinMinimalDenom: 'cufo',
              coinDecimals: 18,
            },
            {
              coinDenom: 'UST (ERC-20)',
              coinMinimalDenom: 'cust',
              coinDecimals: 18,
            },
            {
              coinDenom: '0chain',
              coinMinimalDenom: 'czcn',
              coinDecimals: 18,
            },
            {
              coinDenom: 'Unizen',
              coinMinimalDenom: 'czcx',
              coinDecimals: 18,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: 'ROWAN',
              coinMinimalDenom: 'rowan',
              coinDecimals: 18,
              coinGeckoId: 'sifchain',
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/sifchain/rowan.png',
              gasPriceStep: {
                low: 1000000000000,
                average: 1500000000000,
                high: 2000000000000,
              },
            },
          ],
          features: [],
        });
      }

      if (lastEmbedChainInfos.find(c => c.chainId === 'gravity-bridge-3')) {
        await chainsService.addSuggestedChainInfo({
          rpc: 'https://rpc-gravity-bridge.keplr.app',
          rest: 'https://lcd-gravity-bridge.keplr.app',
          chainId: 'gravity-bridge-3',
          chainName: 'Gravity Bridge',
          chainSymbolImageUrl:
            'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/chain.png',
          stakeCurrency: {
            coinDenom: 'GRAV',
            coinMinimalDenom: 'ugraviton',
            coinDecimals: 6,
            coinGeckoId: 'graviton',
            coinImageUrl:
              'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/ugraviton.png',
          },
          walletUrl: 'https://wallet.keplr.app/chains/gravity-bridge',
          walletUrlForStaking: 'https://wallet.keplr.app/chains/gravity-bridge',
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: 'gravity',
            bech32PrefixAccPub: 'gravitypub',
            bech32PrefixValAddr: 'gravityvaloper',
            bech32PrefixValPub: 'gravityvaloperpub',
            bech32PrefixConsAddr: 'gravityvalcons',
            bech32PrefixConsPub: 'gravityvalconspub',
          },
          currencies: [
            {
              coinDenom: 'GRAV',
              coinMinimalDenom: 'ugraviton',
              coinDecimals: 6,
              coinGeckoId: 'graviton',
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/ugraviton.png',
            },
            {
              coinDenom: 'PSTAKE',
              coinMinimalDenom:
                'gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006',
              coinDecimals: 18,
              coinGeckoId: 'pstake-finance',
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006.png',
            },
            {
              coinDenom: 'USDC',
              coinMinimalDenom:
                'gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              coinDecimals: 6,
              coinGeckoId: 'usd-coin',
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png',
            },
            {
              coinDenom: 'USDT',
              coinMinimalDenom:
                'gravity0xdAC17F958D2ee523a2206206994597C13D831ec7',
              coinDecimals: 6,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xdAC17F958D2ee523a2206206994597C13D831ec7.png',
            },
            {
              coinDenom: 'GTON',
              coinMinimalDenom:
                'gravity0x01e0E2e61f554eCAaeC0cC933E739Ad90f24a86d',
              coinDecimals: 18,
            },
            {
              coinDenom: 'EROWAN',
              coinMinimalDenom:
                'gravity0x07baC35846e5eD502aA91AdF6A9e7aA210F2DcbE',
              coinDecimals: 18,
            },
            {
              coinDenom: 'GEO',
              coinMinimalDenom:
                'gravity0x147faF8De9d8D8DAAE129B187F0D02D819126750',
              coinDecimals: 18,
            },
            {
              coinDenom: 'UNI',
              coinMinimalDenom:
                'gravity0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984.png',
            },
            {
              coinDenom: 'WBTC',
              coinMinimalDenom:
                'gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
              coinDecimals: 8,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.png',
            },
            {
              coinDenom: 'WSCRT',
              coinMinimalDenom:
                'gravity0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be',
              coinDecimals: 6,
            },
            {
              coinDenom: 'stkETH',
              coinMinimalDenom:
                'gravity0x2C5Bcad9Ade17428874855913Def0A02D8bE2324',
              coinDecimals: 18,
            },
            {
              coinDenom: 'SD',
              coinMinimalDenom:
                'gravity0x30D20208d987713f46DFD34EF128Bb16C404D10f',
              coinDecimals: 18,
            },
            {
              coinDenom: 'WDOGE',
              coinMinimalDenom:
                'gravity0x35a532d376FFd9a705d0Bb319532837337A398E7',
              coinDecimals: 18,
            },
            {
              coinDenom: 'PAXG',
              coinMinimalDenom:
                'gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78.png',
            },
            {
              coinDenom: 'AXL',
              coinMinimalDenom:
                'gravity0x467719aD09025FcC6cF6F8311755809d45a5E5f3',
              coinDecimals: 6,
            },
            {
              coinDenom: 'XKI',
              coinMinimalDenom:
                'gravity0x4f6103BAd230295baCF30f914FDa7D4273B7F585',
              coinDecimals: 6,
            },
            {
              coinDenom: 'LINK',
              coinMinimalDenom:
                'gravity0x514910771AF9Ca656af840dff83E8264EcF986CA',
              coinDecimals: 18,
            },
            {
              coinDenom: 'PAGE',
              coinMinimalDenom:
                'gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e',
              coinDecimals: 8,
            },
            {
              coinDenom: 'DAI',
              coinMinimalDenom:
                'gravity0x6B175474E89094C44Da98b954EedeAC495271d0F',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x6B175474E89094C44Da98b954EedeAC495271d0F.png',
            },
            {
              coinDenom: 'MATIC',
              coinMinimalDenom:
                'gravity0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0.png',
            },
            {
              coinDenom: 'CUDOS',
              coinMinimalDenom:
                'gravity0x817bbDbC3e8A1204f3691d14bB44992841e3dB35',
              coinDecimals: 18,
            },
            {
              coinDenom: 'FRAX',
              coinMinimalDenom:
                'gravity0x853d955aCEf822Db058eb8505911ED77F175b99e',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x853d955aCEf822Db058eb8505911ED77F175b99e.png',
            },
            {
              coinDenom: 'xFUND',
              coinMinimalDenom:
                'gravity0x892A6f9dF0147e5f079b0993F486F9acA3c87881',
              coinDecimals: 9,
            },
            {
              coinDenom: 'GET',
              coinMinimalDenom:
                'gravity0x8a854288a5976036A725879164Ca3e91d30c6A1B',
              coinDecimals: 18,
            },
            {
              coinDenom: 'WEVMOS',
              coinMinimalDenom:
                'gravity0x93581991f68DBaE1eA105233b67f7FA0D6BDeE7b',
              coinDecimals: 18,
            },
            {
              coinDenom: 'SHIB',
              coinMinimalDenom:
                'gravity0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE.png',
            },
            {
              coinDenom: 'CRO',
              coinMinimalDenom:
                'gravity0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b',
              coinDecimals: 8,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b.png',
            },
            {
              coinDenom: 'STORJ',
              coinMinimalDenom:
                'gravity0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC',
              coinDecimals: 8,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC.png',
            },
            {
              coinDenom: 'BAND',
              coinMinimalDenom:
                'gravity0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55',
              coinDecimals: 18,
            },
            {
              coinDenom: 'WETH',
              coinMinimalDenom:
                'gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
              coinDecimals: 18,
            },
            {
              coinDenom: 'USTC',
              coinMinimalDenom:
                'gravity0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
              coinDecimals: 18,
            },
            {
              coinDenom: 'somm',
              coinMinimalDenom:
                'gravity0xa670d7237398238DE01267472C6f13e5B8010FD1',
              coinDecimals: 6,
            },
            {
              coinDenom: 'UST',
              coinMinimalDenom:
                'gravity0xa693B19d2931d498c5B318dF961919BB4aee87a5',
              coinDecimals: 6,
            },
            {
              coinDenom: 'stETH',
              coinMinimalDenom:
                'gravity0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84.png',
            },
            {
              coinDenom: 'FET',
              coinMinimalDenom:
                'gravity0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
              coinDecimals: 18,
            },
            {
              coinDenom: 'UMEE',
              coinMinimalDenom:
                'gravity0xc0a4Df35568F116C370E6a6A6022Ceb908eedDaC',
              coinDecimals: 6,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: 'GRAV',
              coinMinimalDenom: 'ugraviton',
              coinDecimals: 6,
              coinGeckoId: 'graviton',
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/ugraviton.png',
            },
            {
              coinDenom: 'USDC',
              coinMinimalDenom:
                'gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              coinDecimals: 6,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png',
              gasPriceStep: {
                low: 0.0002,
                average: 0.0005,
                high: 0.0008,
              },
            },
            {
              coinDenom: 'USDT',
              coinMinimalDenom:
                'gravity0xdAC17F958D2ee523a2206206994597C13D831ec7',
              coinDecimals: 6,
              gasPriceStep: {
                low: 0.0002,
                average: 0.0005,
                high: 0.0008,
              },
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xdAC17F958D2ee523a2206206994597C13D831ec7.png',
            },
            {
              coinDenom: 'FUND',
              coinMinimalDenom:
                'ibc/D157AD8A50DAB0FC4EB95BBE1D9407A590FA2CDEE04C90A76C005089BF76E519',
              coinDecimals: 9,
            },
            {
              coinDenom: 'MNTL',
              coinMinimalDenom:
                'ibc/00F2B62EB069321A454B708876476AFCD9C23C8C9C4A5A206DDF1CD96B645057',
              coinDecimals: 6,
            },
            {
              coinDenom: 'CHEQ',
              coinMinimalDenom:
                'ibc/5012B1C96F286E8A6604A87037CE51241C6F1CA195B71D1E261FCACB69FB6BC2',
              coinDecimals: 9,
            },
            {
              coinDenom: 'HUAHUA',
              coinMinimalDenom:
                'ibc/048BE20AE2E6BFD4142C547E04F17E5F94363003A12B7B6C084E08101BFCF7D1',
              coinDecimals: 6,
            },
            {
              coinDenom: 'STARS',
              coinMinimalDenom:
                'ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602',
              coinDecimals: 6,
            },
            {
              coinDenom: 'CMDX',
              coinMinimalDenom:
                'ibc/29A7122D024B5B8FA8A2EFBB4FA47272C25C8926AA005A96807127208082DAB3',
              coinDecimals: 6,
            },
            {
              coinDenom: 'ATOM',
              coinMinimalDenom:
                'ibc/2E5D0AC026AC1AFA65A23023BA4F24BB8DDF94F118EDC0BAD6F625BFC557CDED',
              coinDecimals: 6,
            },
            {
              coinDenom: 'NYM',
              coinMinimalDenom:
                'ibc/0C273962C274B2C05B22D9474BFE5B84D6A6FCAD198CB9B0ACD35EA521A36606',
              coinDecimals: 6,
            },
            {
              coinDenom: 'GTON',
              coinMinimalDenom:
                'gravity0x01e0E2e61f554eCAaeC0cC933E739Ad90f24a86d',
              coinDecimals: 18,
            },
            {
              coinDenom: 'EROWAN',
              coinMinimalDenom:
                'gravity0x07baC35846e5eD502aA91AdF6A9e7aA210F2DcbE',
              coinDecimals: 18,
            },
            {
              coinDenom: 'GEO',
              coinMinimalDenom:
                'gravity0x147faF8De9d8D8DAAE129B187F0D02D819126750',
              coinDecimals: 18,
            },
            {
              coinDenom: 'UNI',
              coinMinimalDenom:
                'gravity0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984.png',
            },
            {
              coinDenom: 'WBTC',
              coinMinimalDenom:
                'gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
              coinDecimals: 8,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.png',
            },
            {
              coinDenom: 'WSCRT',
              coinMinimalDenom:
                'gravity0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be',
              coinDecimals: 6,
            },
            {
              coinDenom: 'stkETH',
              coinMinimalDenom:
                'gravity0x2C5Bcad9Ade17428874855913Def0A02D8bE2324',
              coinDecimals: 18,
            },
            {
              coinDenom: 'SD',
              coinMinimalDenom:
                'gravity0x30D20208d987713f46DFD34EF128Bb16C404D10f',
              coinDecimals: 18,
            },
            {
              coinDenom: 'WDOGE',
              coinMinimalDenom:
                'gravity0x35a532d376FFd9a705d0Bb319532837337A398E7',
              coinDecimals: 18,
            },
            {
              coinDenom: 'PAXG',
              coinMinimalDenom:
                'gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78.png',
            },
            {
              coinDenom: 'AXL',
              coinMinimalDenom:
                'gravity0x467719aD09025FcC6cF6F8311755809d45a5E5f3',
              coinDecimals: 6,
            },
            {
              coinDenom: 'XKI',
              coinMinimalDenom:
                'gravity0x4f6103BAd230295baCF30f914FDa7D4273B7F585',
              coinDecimals: 6,
            },
            {
              coinDenom: 'LINK',
              coinMinimalDenom:
                'gravity0x514910771AF9Ca656af840dff83E8264EcF986CA',
              coinDecimals: 18,
            },
            {
              coinDenom: 'PAGE',
              coinMinimalDenom:
                'gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e',
              coinDecimals: 8,
            },
            {
              coinDenom: 'DAI',
              coinMinimalDenom:
                'gravity0x6B175474E89094C44Da98b954EedeAC495271d0F',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x6B175474E89094C44Da98b954EedeAC495271d0F.png',
            },
            {
              coinDenom: 'MATIC',
              coinMinimalDenom:
                'gravity0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0.png',
            },
            {
              coinDenom: 'CUDOS',
              coinMinimalDenom:
                'gravity0x817bbDbC3e8A1204f3691d14bB44992841e3dB35',
              coinDecimals: 18,
            },
            {
              coinDenom: 'FRAX',
              coinMinimalDenom:
                'gravity0x853d955aCEf822Db058eb8505911ED77F175b99e',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x853d955aCEf822Db058eb8505911ED77F175b99e.png',
            },
            {
              coinDenom: 'xFUND',
              coinMinimalDenom:
                'gravity0x892A6f9dF0147e5f079b0993F486F9acA3c87881',
              coinDecimals: 9,
            },
            {
              coinDenom: 'GET',
              coinMinimalDenom:
                'gravity0x8a854288a5976036A725879164Ca3e91d30c6A1B',
              coinDecimals: 18,
            },
            {
              coinDenom: 'WEVMOS',
              coinMinimalDenom:
                'gravity0x93581991f68DBaE1eA105233b67f7FA0D6BDeE7b',
              coinDecimals: 18,
            },
            {
              coinDenom: 'SHIB',
              coinMinimalDenom:
                'gravity0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE.png',
            },
            {
              coinDenom: 'CRO',
              coinMinimalDenom:
                'gravity0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b',
              coinDecimals: 8,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b.png',
            },
            {
              coinDenom: 'STORJ',
              coinMinimalDenom:
                'gravity0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC',
              coinDecimals: 8,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC.png',
            },
            {
              coinDenom: 'BAND',
              coinMinimalDenom:
                'gravity0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55',
              coinDecimals: 18,
            },
            {
              coinDenom: 'WETH',
              coinMinimalDenom:
                'gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
              coinDecimals: 18,
            },
            {
              coinDenom: 'USTC',
              coinMinimalDenom:
                'gravity0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
              coinDecimals: 18,
            },
            {
              coinDenom: 'somm',
              coinMinimalDenom:
                'gravity0xa670d7237398238DE01267472C6f13e5B8010FD1',
              coinDecimals: 6,
            },
            {
              coinDenom: 'UST',
              coinMinimalDenom:
                'gravity0xa693B19d2931d498c5B318dF961919BB4aee87a5',
              coinDecimals: 6,
            },
            {
              coinDenom: 'stETH',
              coinMinimalDenom:
                'gravity0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
              coinDecimals: 18,
              coinImageUrl:
                'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/gravity-bridge/gravity0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84.png',
            },
            {
              coinDenom: 'FET',
              coinMinimalDenom:
                'gravity0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
              coinDecimals: 18,
            },
            {
              coinDenom: 'UMEE',
              coinMinimalDenom:
                'gravity0xc0a4Df35568F116C370E6a6A6022Ceb908eedDaC',
              coinDecimals: 6,
            },
          ],
          features: [],
        });
      }
    } catch (e) {
      console.log(e);
    }
  },
);

router.listen(BACKGROUND_PORT, initFn);
