import "reflect-metadata";

import { container } from "tsyringe";
import { TYPES } from "./types";

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

import { KVStore } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { RNG } from "@keplr-wallet/crypto";
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
  rng: RNG,
  commonCrypto: CommonCrypto,
  notification: Notification,
  ledgerOptions: Partial<LedgerOptions> = {}
) {
  container.register(TYPES.ChainsEmbedChainInfos, {
    useValue: embedChainInfos,
  });

  container.register(TYPES.EventMsgRequester, {
    useValue: eventMsgRequester,
  });
  container.register(TYPES.RNG, { useValue: rng });
  container.register(TYPES.CommonCrypto, { useValue: commonCrypto });
  container.register(TYPES.Notification, { useValue: notification });

  container.register(TYPES.ChainsStore, { useValue: storeCreator("chains") });
  container.register(TYPES.InteractionStore, {
    useValue: storeCreator("interaction"),
  });
  container.register(TYPES.KeyRingStore, { useValue: storeCreator("keyring") });
  container.register(TYPES.LedgerStore, { useValue: storeCreator("ledger") });
  container.register(TYPES.LedgerOptions, { useValue: ledgerOptions });

  container.register(TYPES.PermissionStore, {
    useValue: storeCreator("permission"),
  });
  container.register(TYPES.PermissionServicePrivilegedOrigins, {
    useValue: privilegedOrigins,
  });
  container.register(TYPES.PersistentMemoryStore, {
    useValue: storeCreator("persistent-memory"),
  });
  container.register(TYPES.SecretWasmStore, {
    useValue: storeCreator("secretwasm"),
  });
  container.register(TYPES.TokensStore, { useValue: storeCreator("tokens") });
  container.register(TYPES.TxStore, {
    useValue: storeCreator("background-tx"),
  });
  container.register(TYPES.UpdaterStore, { useValue: storeCreator("updator") });

  const interactionService = container.resolve(Interaction.InteractionService);
  Interaction.init(router, interactionService);

  const persistentMemory = container.resolve(
    PersistentMemory.PersistentMemoryService
  );
  PersistentMemory.init(router, persistentMemory);

  const permissionService = container.resolve(Permission.PermissionService);
  Permission.init(router, permissionService);

  const chainUpdaterService = container.resolve(Updater.ChainUpdaterService);
  Updater.init(router, chainUpdaterService);

  const tokensService = container.resolve(Tokens.TokensService);
  Tokens.init(router, tokensService);

  const chainsService = container.resolve(Chains.ChainsService);
  Chains.init(router, chainsService);

  const ledgerService = container.resolve(Ledger.LedgerService);
  Ledger.init(router, ledgerService);

  const keyRingService = container.resolve(KeyRing.KeyRingService);
  KeyRing.init(router, keyRingService);

  const secretWasmService = container.resolve(SecretWasm.SecretWasmService);
  SecretWasm.init(router, secretWasmService);

  const backgroundTxService = container.resolve(
    BackgroundTx.BackgroundTxService
  );
  BackgroundTx.init(router, backgroundTxService);
}
