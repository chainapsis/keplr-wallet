import { MessageManager } from "../common/message";

import * as PersistentMemory from "./persistent-memory/internal";
import * as Chains from "./chains/internal";
import * as KeyRing from "./keyring/internal";
import * as BackgroundTx from "./tx/internal";

import { BrowserKVStore } from "../common/kvstore";

import { BACKGROUND_PORT } from "../common/message/constant";

const messageManager = new MessageManager();

const persistentMemory = new PersistentMemory.PersistentMemoryKeeper();
PersistentMemory.init(messageManager, persistentMemory);

const chainsKeeper = new Chains.ChainsKeeper(new BrowserKVStore("chains"));
Chains.init(messageManager, chainsKeeper);

const keyRingKeeper = new KeyRing.KeyRingKeeper(
  new BrowserKVStore("keyring"),
  chainsKeeper
);
KeyRing.init(messageManager, keyRingKeeper);

const backgroundTxKeeper = new BackgroundTx.BackgroundTxKeeper(chainsKeeper);
BackgroundTx.init(messageManager, backgroundTxKeeper);

messageManager.listen(BACKGROUND_PORT);
