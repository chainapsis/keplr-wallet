import { MessageRequester, Router } from "@keplr-wallet/router";

import * as PersistentMemory from "./persistent-memory/internal";
import * as Chains from "./chains/internal";
import * as Ledger from "./ledger/internal";
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

export * from "./persistent-memory";
export * from "./chains";
export * from "./ledger";
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

import { KVStore } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { CommonCrypto } from "./keyring";
import { Notification } from "./tx";
import { LedgerOptions } from "./ledger/options";

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

  const persistentMemoryService = new PersistentMemory.PersistentMemoryService();

  const permissionService = new Permission.PermissionService(
    storeCreator("permission"),
    privilegedOrigins
  );

  const chainUpdaterService = new Updater.ChainUpdaterService(
    storeCreator("updator"),
    communityChainInfoRepo
  );

  const tokensService = new Tokens.TokensService(storeCreator("tokens"));

  const chainsService = new Chains.ChainsService(
    storeCreator("chains"),
    embedChainInfos,
    {
      useMemoryKVStoreForSuggestChain:
        experimentalOptions.suggestChain?.useMemoryKVStore,
    }
  );

  const ledgerService = new Ledger.LedgerService(
    storeCreator("ledger"),
    ledgerOptions
  );

  const keyRingService = new KeyRing.KeyRingService(
    storeCreator("keyring"),
    embedChainInfos,
    commonCrypto
  );

  const secretWasmService = new SecretWasm.SecretWasmService(
    storeCreator("secretwasm")
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
  const autoLockAccountService = new AutoLocker.AutoLockAccountService(
    storeCreator("auto-lock-account")
  );
  const analyticsService = new Analytics.AnalyticsService(
    storeCreator("background.analytics"),
    commonCrypto.rng,
    analyticsPrivilegedOrigins
  );

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
  keyRingService.init(
    interactionService,
    chainsService,
    permissionService,
    ledgerService
  );
  secretWasmService.init(chainsService, keyRingService, permissionService);
  backgroundTxService.init(chainsService, permissionService);
  phishingListService.init();
  // No need to wait because user can't interact with app right after launch.
  autoLockAccountService.init(keyRingService);
  // No need to wait because user can't interact with app right after launch.
  analyticsService.init();

  Interaction.init(router, interactionService);
  PersistentMemory.init(router, persistentMemoryService);
  Permission.init(router, permissionService);
  Updater.init(router, chainUpdaterService);
  Tokens.init(router, tokensService);
  Chains.init(router, chainsService);
  Ledger.init(router, ledgerService);
  KeyRing.init(router, keyRingService);
  SecretWasm.init(router, secretWasmService);
  BackgroundTx.init(router, backgroundTxService);
  PhishingList.init(router, phishingListService);
  AutoLocker.init(router, autoLockAccountService);
  Analytics.init(router, analyticsService);
}
