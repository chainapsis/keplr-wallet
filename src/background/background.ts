import { MessageManager } from "../common/message";
import * as PersistentMemory from "./persistent-memory/internal";
import * as KeyRing from "./keyring/internal";
import * as BackgroundTx from "./tx/internal";
import { BACKGROUND_PORT } from "../common/message/constant";

const messageManager = new MessageManager();
PersistentMemory.init(messageManager);
const keyRingKeeper = KeyRing.init(messageManager);
BackgroundTx.init(messageManager, keyRingKeeper);

messageManager.listen(BACKGROUND_PORT);
