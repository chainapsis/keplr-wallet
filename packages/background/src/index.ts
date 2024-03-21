import { MessageRequester, Router } from "@keplr-wallet/router";

import * as KeyRingLegacy from "./keyring/legacy";

import * as Chains from "./chains/internal";
import * as ChainsUI from "./chains-ui/internal";
import * as ChainsUpdate from "./chains-update/internal";
import * as SecretWasm from "./secret-wasm/internal";
import * as BackgroundTx from "./tx/internal";
import * as BackgroundTxEthereum from "./tx-ethereum/internal";
import * as TokenCW20 from "./token-cw20/internal";
import * as TokenERC20 from "./token-erc20/internal";
import * as Interaction from "./interaction/internal";
import * as Permission from "./permission/internal";
import * as PhishingList from "./phishing-list/internal";
import * as AutoLocker from "./auto-lock-account/internal";
import * as Analytics from "./analytics/internal";
import * as Vault from "./vault/internal";
import * as KeyRingV2 from "./keyring/internal";
import * as KeyRingMnemonic from "./keyring-mnemonic/internal";
import * as KeyRingLedger from "./keyring-ledger/internal";
import * as KeyRingKeystone from "./keyring-keystone/internal";
import * as KeyRingPrivateKey from "./keyring-private-key/internal";
import * as KeyRingCosmos from "./keyring-cosmos/internal";
import * as KeyRingEthereum from "./keyring-ethereum/internal";
import * as PermissionInteractive from "./permission-interactive/internal";
import * as TokenScan from "./token-scan/internal";
import * as RecentSendHistory from "./recent-send-history/internal";

export * from "./chains";
export * from "./chains-ui";
export * from "./chains-update";
export * from "./secret-wasm";
export * from "./tx";
export * from "./token-cw20";
export * from "./token-erc20";
export * from "./interaction";
export * from "./permission";
export * from "./phishing-list";
export * from "./auto-lock-account";
export * from "./analytics";
export * from "./permission-interactive";
export * from "./keyring";
export * from "./vault";
export * from "./keyring-cosmos";
export * from "./keyring-ethereum";
export * from "./keyring-keystone";
export * from "./token-scan";
export * from "./recent-send-history";

import { KVStore } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { Notification } from "./tx";
import { ChainInfoWithCoreTypes } from "./chains";

export function init(
  router: Router,
  storeCreator: (prefix: string) => KVStore,
  // Message requester to the content script.
  eventMsgRequester: MessageRequester,
  embedChainInfos: ChainInfo[],
  // The origins that are able to pass any permission.
  privilegedOrigins: string[],
  analyticsPrivilegedOrigins: string[],
  msgPrivilegedOrigins: string[],
  communityChainInfoRepo: {
    readonly organizationName: string;
    readonly repoName: string;
    readonly branchName: string;
    readonly alternativeURL?: string;
  },
  notification: Notification,
  blocklistPageURL: string,
  keyRingMigrations: {
    commonCrypto: KeyRingLegacy.CommonCrypto;
    readonly getDisabledChainIdentifiers: () => Promise<string[]>;
  },
  afterInitFn?: (
    service: Chains.ChainsService,
    lastEmbedChainInfos: ChainInfoWithCoreTypes[]
  ) => void | Promise<void>
): {
  initFn: () => Promise<void>;
  keyRingService: KeyRingV2.KeyRingService;
} {
  const interactionService = new Interaction.InteractionService(
    eventMsgRequester
  );

  const chainsService = new Chains.ChainsService(
    storeCreator("chains-v2"),
    {
      kvStore: storeCreator("chains"),
      updaterKVStore: storeCreator("updator"),
    },
    embedChainInfos,
    communityChainInfoRepo,
    interactionService,
    afterInitFn
  );

  const tokenCW20Service = new TokenCW20.TokenCW20Service(
    storeCreator("tokens"),
    chainsService,
    interactionService
  );

  const tokenERC20Service = new TokenERC20.TokenERC20Service(
    storeCreator("tokens-erc20"),
    chainsService,
    interactionService
  );

  const permissionService = new Permission.PermissionService(
    storeCreator("permission"),
    privilegedOrigins,
    interactionService,
    chainsService
  );

  const backgroundTxService = new BackgroundTx.BackgroundTxService(
    chainsService,
    notification
  );

  const backgroundTxEthereumService =
    new BackgroundTxEthereum.BackgroundTxEthereumService(
      chainsService,
      notification
    );

  const phishingListService = new PhishingList.PhishingListService(
    {
      blockListUrl:
        "https://raw.githubusercontent.com/chainapsis/phishing-block-list/main/block-list.txt",
      twitterListUrl:
        "https://raw.githubusercontent.com/chainapsis/phishing-block-list/main/twitter-scammer-list.txt",
      fetchingIntervalMs: 3 * 3600 * 1000, // 3 hours
      retryIntervalMs: 10 * 60 * 1000, // 10 mins,
      allowTimeoutMs: 10 * 60 * 1000, // 10 mins,,
    },
    blocklistPageURL
  );
  const analyticsService = new Analytics.AnalyticsService(
    storeCreator("background.analytics"),
    analyticsPrivilegedOrigins
  );

  const vaultService = new Vault.VaultService(storeCreator("vault"));

  const chainsUIService = new ChainsUI.ChainsUIService(
    storeCreator("chains-ui"),
    chainsService,
    vaultService
  );

  const keyRingV2Service = new KeyRingV2.KeyRingService(
    storeCreator("keyring-v2"),
    {
      kvStore: storeCreator("keyring"),
      commonCrypto: keyRingMigrations.commonCrypto,
      getDisabledChainIdentifiers:
        keyRingMigrations.getDisabledChainIdentifiers,
      chainsUIService,
    },
    chainsService,
    interactionService,
    vaultService,
    analyticsService,
    [
      new KeyRingMnemonic.KeyRingMnemonicService(vaultService),
      new KeyRingLedger.KeyRingLedgerService(),
      new KeyRingPrivateKey.KeyRingPrivateKeyService(vaultService),
      new KeyRingKeystone.KeyRingKeystoneService(),
    ]
  );
  const keyRingCosmosService = new KeyRingCosmos.KeyRingCosmosService(
    chainsService,
    keyRingV2Service,
    interactionService,
    chainsUIService,
    analyticsService,
    msgPrivilegedOrigins
  );
  const keyRingEthereumService = new KeyRingEthereum.KeyRingEthereumService(
    chainsService,
    keyRingV2Service,
    keyRingCosmosService,
    interactionService,
    analyticsService
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

  const chainsUpdateService = new ChainsUpdate.ChainsUpdateService(
    storeCreator("chains-update"),
    chainsService,
    chainsUIService
  );

  const secretWasmService = new SecretWasm.SecretWasmService(
    storeCreator("secretwasm"),
    chainsService,
    keyRingCosmosService
  );

  const tokenScanService = new TokenScan.TokenScanService(
    storeCreator("token-scan"),
    chainsService,
    chainsUIService,
    vaultService,
    keyRingV2Service,
    keyRingCosmosService
  );

  const recentSendHistoryService =
    new RecentSendHistory.RecentSendHistoryService(
      storeCreator("recent-send-history"),
      chainsService,
      backgroundTxService,
      notification
    );

  Interaction.init(router, interactionService);
  Permission.init(router, permissionService);
  Chains.init(
    router,
    chainsService,
    permissionService,
    permissionInteractiveService
  );
  BackgroundTx.init(router, backgroundTxService, permissionInteractiveService);
  BackgroundTxEthereum.init(
    router,
    backgroundTxEthereumService,
    permissionInteractiveService
  );
  PhishingList.init(router, phishingListService);
  AutoLocker.init(router, autoLockAccountService);
  Analytics.init(router, analyticsService);
  KeyRingV2.init(router, keyRingV2Service);
  KeyRingCosmos.init(
    router,
    keyRingCosmosService,
    permissionInteractiveService
  );
  KeyRingEthereum.init(
    router,
    keyRingEthereumService,
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
  TokenERC20.init(router, tokenERC20Service, permissionInteractiveService);
  SecretWasm.init(router, secretWasmService, permissionInteractiveService);
  TokenScan.init(router, tokenScanService);
  RecentSendHistory.init(router, recentSendHistoryService);

  return {
    initFn: async () => {
      await analyticsService.init();

      await chainsService.init();
      await vaultService.init();
      await chainsUIService.init();
      await chainsUpdateService.init();
      await keyRingV2Service.init();
      await keyRingCosmosService.init();
      await keyRingEthereumService.init();
      await permissionService.init();
      await tokenCW20Service.init();
      await tokenERC20Service.init();

      await backgroundTxService.init();
      await backgroundTxEthereumService.init();
      await phishingListService.init();
      await autoLockAccountService.init();
      await permissionInteractiveService.init();

      await secretWasmService.init();

      await tokenScanService.init();

      await recentSendHistoryService.init();

      await chainsService.afterInit();
    },
    keyRingService: keyRingV2Service,
  };
}
