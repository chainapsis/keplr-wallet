import { MessageRequester, Router } from "@keplr-wallet/router";

import * as Chains from "./chains/internal";
import * as ChainsUI from "./chains-ui/internal";
import * as ChainsUpdate from "./chains-update/internal";
import * as Ledger from "./ledger/internal";
import * as Keystone from "./keystone/internal";
import * as KeyRing from "./keyring/internal";
import * as SecretWasm from "./secret-wasm/internal";
import * as BackgroundTx from "./tx/internal";
import * as TokenCW20 from "./token-cw20/internal";
import * as Interaction from "./interaction/internal";
import * as Permission from "./permission/internal";
import * as PhishingList from "./phishing-list/internal";
import * as AutoLocker from "./auto-lock-account/internal";
import * as Analytics from "./analytics/internal";
import * as Vault from "./vault/internal";
import * as KeyRingV2 from "./keyring-v2/internal";
import * as KeyRingMnemonic from "./keyring-mnemonic/internal";
import * as KeyRingLedger from "./keyring-ledger/internal";
import * as KeyRingPrivateKey from "./keyring-private-key/internal";
import * as KeyRingCosmos from "./keyring-cosmos/internal";
import * as PermissionInteractive from "./permission-interactive/internal";

export * from "./chains";
export * from "./chains-ui";
export * from "./chains-update";
export * from "./ledger";
export * from "./keystone";
export * from "./keyring";
export * from "./secret-wasm";
export * from "./tx";
export * from "./token-cw20";
export * from "./interaction";
export * from "./permission";
export * from "./phishing-list";
export * from "./auto-lock-account";
export * from "./analytics";
export * from "./permission-interactive";
export * as KeyRingV2 from "./keyring-v2";
export * from "./vault";
export * from "./keyring-cosmos";

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
  ledgerOptions: Partial<LedgerOptions> = {}
): {
  initFn: () => Promise<void>;
} {
  const interactionService = new Interaction.InteractionService(
    eventMsgRequester
  );

  const chainsService = new Chains.ChainsService(
    storeCreator("chains"),
    embedChainInfos,
    communityChainInfoRepo
  );

  const tokenCW20Service = new TokenCW20.TokenCW20Service(
    storeCreator("tokens"),
    chainsService,
    interactionService
  );

  const permissionService = new Permission.PermissionService(
    storeCreator("permission"),
    privilegedOrigins,
    interactionService,
    chainsService
  );

  const ledgerService = new Ledger.LedgerService(
    storeCreator("ledger"),
    ledgerOptions
  );

  const keystoneService = new Keystone.KeystoneService(
    storeCreator("keystone")
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
  const analyticsService = new Analytics.AnalyticsService(
    storeCreator("background.analytics"),
    commonCrypto.rng,
    analyticsPrivilegedOrigins
  );

  const vaultService = new Vault.VaultService(storeCreator("vault"));
  const keyRingV2Service = new KeyRingV2.KeyRingService(
    storeCreator("keyring-v2"),
    chainsService,
    interactionService,
    vaultService,
    [
      new KeyRingMnemonic.KeyRingMnemonicService(vaultService),
      new KeyRingLedger.KeyRingLedgerService(),
      new KeyRingPrivateKey.KeyRingPrivateKeyService(vaultService),
    ]
  );
  const keyRingCosmosService = new KeyRingCosmos.KeyRingCosmosService(
    chainsService,
    keyRingV2Service,
    interactionService
  );
  const autoLockAccountService = new AutoLocker.AutoLockAccountService(
    storeCreator("auto-lock-account"),
    keyRingV2Service
  );
  const permissionInteractiveService =
    new PermissionInteractive.PermissionInteractiveService(
      permissionService,
      keyRingV2Service
    );

  const chainsUIService = new ChainsUI.ChainsUIService(
    storeCreator("chains-ui"),
    chainsService,
    vaultService
  );

  const chainsUpdateService = new ChainsUpdate.ChainsUpdateService(
    storeCreator("chains-update"),
    chainsService,
    chainsUIService
  );

  Interaction.init(router, interactionService);
  Permission.init(router, permissionService);
  Chains.init(router, chainsService);
  Ledger.init(router, ledgerService);
  KeyRing.init(router, keyRingService);
  SecretWasm.init(router, secretWasmService);
  BackgroundTx.init(router, backgroundTxService);
  PhishingList.init(router, phishingListService);
  AutoLocker.init(router, autoLockAccountService);
  Analytics.init(router, analyticsService);
  KeyRingV2.init(router, keyRingV2Service);
  KeyRingCosmos.init(
    router,
    keyRingCosmosService,
    permissionInteractiveService
  );
  PermissionInteractive.init(router, permissionInteractiveService);
  ChainsUI.init(router, chainsUIService);
  ChainsUpdate.init(router, chainsUpdateService);
  TokenCW20.init(
    router,
    tokenCW20Service,
    permissionInteractiveService,
    keyRingCosmosService
  );

  return {
    initFn: async () => {
      await chainsService.init();
      await vaultService.init();
      await chainsUIService.init();
      await chainsUpdateService.init();
      await keyRingV2Service.init();
      await keyRingCosmosService.init();
      await permissionService.init();
      await tokenCW20Service.init();

      ledgerService.init(interactionService);
      keystoneService.init(interactionService);
      keyRingService.init(
        interactionService,
        chainsService,
        permissionService,
        ledgerService,
        keystoneService
      );
      secretWasmService.init(chainsService, keyRingService, permissionService);
      backgroundTxService.init(chainsService, permissionService);
      phishingListService.init();
      await autoLockAccountService.init();
      // No need to wait because user can't interact with app right after launch.
      await analyticsService.init();
      await permissionInteractiveService.init();
    },
  };
}
