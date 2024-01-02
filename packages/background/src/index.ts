import { MessageRequester, Router } from "@keplr-wallet/router";

import * as PersistentMemory from "./persistent-memory/internal";
import * as Chains from "./chains/internal";
import * as Ledger from "./ledger/internal";
import * as Keystone from "./keystone/internal";
import * as KeyRing from "./keyring/internal";
import * as SecretWasm from "./secret-wasm/internal";
import * as BackgroundTx from "./tx/internal";
import * as Updater from "./updater/internal";
import * as Tokens from "./tokens/internal";
import * as Interaction from "./interaction/internal";
import * as Permission from "./permission/internal";
import * as PhishingList from "./phishing-list/internal";
import * as AutoLocker from "./auto-lock-account/internal";
import * as Analytics from "./analytics/internal";
import * as Umbral from "./umbral/internal";
import * as Messaging from "./messaging/internal";
import { KVStore } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { CommonCrypto } from "./keyring";
import { Notification } from "./tx";
import { LedgerOptions } from "./ledger/options";

export * from "./persistent-memory";
export * from "./chains";
export * from "./ledger";
export * from "./keystone";
export * from "./keyring";
export * from "./secret-wasm";
export * from "./tx";
export * from "./updater";
export * from "./tokens";
export * from "./interaction";
export * from "./permission";
export * from "./phishing-list";
export * from "./auto-lock-account";
export * from "./analytics";

export function init(
  router: Router,
  storeCreator: (prefix: string) => KVStore,
  // Message requester to the content script.
  eventMsgRequester: MessageRequester,
  embedChainInfos: ChainInfo[],
  // The origins that are able to pass any permission.
  privilegedOrigins: string[],
  analyticsPrivilegedOrigins: string[],
  communityChainInfoRepo: {
    readonly organizationName: string;
    readonly repoName: string;
    readonly branchName: string;
  },
  commonCrypto: CommonCrypto,
  notification: Notification,
  ledgerOptions: Partial<LedgerOptions> = {},
  experimentalOptions: Partial<{
    suggestChain: Partial<{
      // Chains registered as suggest chains are managed in memory.
      // In other words, it disappears when the app is closed.
      // General operation should be fine. This is a temporary solution for the mobile app.
      useMemoryKVStore: boolean;
    }>;
  }> = {}
) {
  const interactionService = new Interaction.InteractionService(
    eventMsgRequester,
    commonCrypto.rng
  );

  const chainsService = new Chains.ChainsService(
    storeCreator("chains"),
    embedChainInfos,
    {
      useMemoryKVStoreForSuggestChain:
        experimentalOptions.suggestChain?.useMemoryKVStore,
    }
  );

  const tokensService = new Tokens.TokensService(storeCreator("tokens"));

  const persistentMemoryService =
    new PersistentMemory.PersistentMemoryService();

  const permissionService = new Permission.PermissionService(
    storeCreator("permission"),
    privilegedOrigins
  );

  const backgroundTxService = new BackgroundTx.BackgroundTxService(
    notification
  );

  const phishingListService = new PhishingList.PhishingListService({
    blockListUrl:
      "https://raw.githubusercontent.com/chainapsis/phishing-block-list/main/block-list.txt",
    twitterListUrl:
      "https://raw.githubusercontent.com/chainapsis/phishing-block-list/main/twitter-scammer-list.txt",
    fetchingIntervalMs: 3 * 3600 * 1000, // 3 hours
    retryIntervalMs: 10 * 60 * 1000, // 10 mins,
    allowTimeoutMs: 10 * 60 * 1000, // 10 mins,
  });

  const analyticsService = new Analytics.AnalyticsService(
    storeCreator("background.analytics"),
    commonCrypto.rng,
    analyticsPrivilegedOrigins
  );

  const keyRingService = new KeyRing.KeyRingService(
    storeCreator("keyring"),
    embedChainInfos,
    commonCrypto
  );

  const autoLockAccountService = new AutoLocker.AutoLockAccountService(
    storeCreator("auto-lock-account")
  );

  const chainUpdaterService = new Updater.ChainUpdaterService(
    storeCreator("updator"),
    communityChainInfoRepo
  );

  const secretWasmService = new SecretWasm.SecretWasmService(
    storeCreator("secretwasm")
  );

  const ledgerService = new Ledger.LedgerService(
    storeCreator("ledger"),
    ledgerOptions
  );

  const keystoneService = new Keystone.KeystoneService(
    storeCreator("keystone")
  );

  const umbralService = new Umbral.UmbralService(chainsService);

  const messagingService = new Messaging.MessagingService();

  Interaction.init(router, interactionService);
  PersistentMemory.init(router, persistentMemoryService);
  Permission.init(router, permissionService);
  Chains.init(router, chainsService);
  BackgroundTx.init(router, backgroundTxService);
  PhishingList.init(router, phishingListService);
  AutoLocker.init(router, autoLockAccountService);
  Analytics.init(router, analyticsService);
  KeyRing.init(router, keyRingService);
  SecretWasm.init(router, secretWasmService);
  Updater.init(router, chainUpdaterService);
  Tokens.init(router, tokensService);
  Ledger.init(router, ledgerService);

  Umbral.init(router, umbralService);
  Messaging.init(router, messagingService);

  return {
    initFn: async () => {
      persistentMemoryService.init();
      permissionService.init(interactionService, chainsService, keyRingService);
      chainUpdaterService.init(chainsService);
      tokensService.init(
        interactionService,
        permissionService,
        chainsService,
        keyRingService
      );
      chainsService.init(
        chainUpdaterService,
        interactionService,
        permissionService
      );
      ledgerService.init(interactionService);
      keystoneService.init(interactionService);
      keyRingService.init(
        interactionService,
        chainsService,
        permissionService,
        ledgerService,
        keystoneService,
        analyticsService
      );
      secretWasmService.init(chainsService, keyRingService, permissionService);
      backgroundTxService.init(chainsService, permissionService);
      phishingListService.init();
      // No need to wait because user can't interact with app right after launch.
      await autoLockAccountService.init(keyRingService);
      // No need to wait because user can't interact with app right after launch.
      await analyticsService.init();
      await umbralService.init(keyRingService, permissionService);
      await messagingService.init(keyRingService);
    },
  };
}
