import { MessageManager } from "../common/message";

import * as PersistentMemory from "./persistent-memory/internal";
import * as Chains from "./chains/internal";
import * as Ledger from "./ledger/internal";
import * as KeyRing from "./keyring/internal";
import * as BackgroundTx from "./tx/internal";

import { BrowserKVStore } from "../common/kvstore";

import { BACKGROUND_PORT } from "../common/message/constant";
import { EmbedAccessOrigins, EmbedChainInfos } from "../config";
import { openWindow } from "../common/window";

const messageManager = new MessageManager();

const persistentMemory = new PersistentMemory.PersistentMemoryKeeper();
PersistentMemory.init(messageManager, persistentMemory);

const chainsKeeper = new Chains.ChainsKeeper(
  new BrowserKVStore("chains"),
  EmbedChainInfos,
  EmbedAccessOrigins,
  openWindow
);
Chains.init(messageManager, chainsKeeper);

const ledgerKeeper = new Ledger.LedgerKeeper();
Ledger.init(messageManager, ledgerKeeper);

const keyRingKeeper = new KeyRing.KeyRingKeeper(
  new BrowserKVStore("keyring"),
  chainsKeeper,
  ledgerKeeper,
  openWindow
);
KeyRing.init(messageManager, keyRingKeeper);

const backgroundTxKeeper = new BackgroundTx.BackgroundTxKeeper(chainsKeeper);
BackgroundTx.init(messageManager, backgroundTxKeeper);

messageManager.listen(BACKGROUND_PORT);
