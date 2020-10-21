import { MessageManager } from "../common/message";

import * as PersistentMemory from "./persistent-memory/internal";
import * as Chains from "./chains/internal";
import * as Ledger from "./ledger/internal";
import * as KeyRing from "./keyring/internal";
import * as BackgroundTx from "./tx/internal";
import * as Updater from "./updater/internal";
import * as Tokens from "./tokens/internal";

import { BrowserKVStore } from "../common/kvstore";

import { BACKGROUND_PORT } from "../common/message/constant";
import { EmbedAccessOrigins, EmbedChainInfos } from "../config";
import { openWindow } from "../common/window";

const messageManager = new MessageManager();

const persistentMemory = new PersistentMemory.PersistentMemoryKeeper();
PersistentMemory.init(messageManager, persistentMemory);

const chainUpdaterKeeper = new Updater.ChainUpdaterKeeper(
  new BrowserKVStore("updater")
);

const chainsKeeper = new Chains.ChainsKeeper(
  new BrowserKVStore("chains"),
  chainUpdaterKeeper,
  EmbedChainInfos,
  EmbedAccessOrigins,
  openWindow
);
Chains.init(messageManager, chainsKeeper);

const tokensKeeper = new Tokens.TokensKeeper(chainsKeeper, chainUpdaterKeeper);
Tokens.init(messageManager, tokensKeeper);

const ledgerKeeper = new Ledger.LedgerKeeper(new BrowserKVStore("ledger"));
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
