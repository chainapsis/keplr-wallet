import {BACKGROUND_PORT} from '@keplr-wallet/router';
import {init} from '@keplr-wallet/background';
import scrypt from 'scrypt-js';
import {Buffer} from 'buffer/';
import {
  RNEnv,
  RNMessageRequesterInternalToUI,
  RNRouterBackground,
} from '../router';
import {CommunityChainInfoRepo, EmbedChainInfos} from '../config';
import {AsyncKVStore} from '../common';

const router = new RNRouterBackground(RNEnv.produceEnv);

const {initFn} = init(
  router,
  (prefix: string) => new AsyncKVStore(prefix),
  new RNMessageRequesterInternalToUI(),
  EmbedChainInfos,
  [],
  [],
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
      const kvStore = new AsyncKVStore('store_chain_config');
      const legacy = await kvStore.get<{disabledChains: string[]}>(
        'extension_chainInfoInUIConfig',
      );
      if (!legacy) {
        return [];
      }
      return legacy.disabledChains ?? [];
    },
  },
);

router.listen(BACKGROUND_PORT, initFn);
