import { MessageManager } from "../common/message";

import * as PersistentMemory from "./persistent-memory/internal";
import * as KeyRing from "./keyring/internal";
import * as BackgroundTx from "./tx/internal";

import { BrowserKVStore } from "../common/kvstore";

import { BACKGROUND_PORT } from "../common/message/constant";

const messageManager = new MessageManager();

const persistentMemory = new PersistentMemory.PersistentMemoryKeeper();
PersistentMemory.init(messageManager, persistentMemory);

const keyRingKeeper = new KeyRing.KeyRingKeeper(new BrowserKVStore("keyring"));
KeyRing.init(messageManager, keyRingKeeper);

const backgroundTxKeeper = new BackgroundTx.BackgroundTxKeeper(keyRingKeeper);
BackgroundTx.init(messageManager, backgroundTxKeeper);

messageManager.listen(BACKGROUND_PORT);
