import { MessageManager } from "../common/message";
import * as PersistentMemory from "./persistent-memory/internal";
import * as KeyRing from "./keyring/internal";
import { BACKGROUND_PORT } from "../common/message/constant";

const messageManager = new MessageManager();
PersistentMemory.init(messageManager);
KeyRing.init(messageManager);

messageManager.listen(BACKGROUND_PORT);
