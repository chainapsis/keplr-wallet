import { MessageManager } from "../common/message";
import * as KeyRing from "../background/keyring/foreground";
import { WEBPAGE_PORT } from "../common/message/constant";

export function listenEvents() {
  const manager = new MessageManager(true);
  // Will dispatch event to type "keplr_keystorechange" under `window` whenever key store is changed.
  const keyRingNotifyKeeper = new KeyRing.KeyRingNotifyKeeper();
  KeyRing.init(manager, keyRingNotifyKeeper);

  manager.listen(WEBPAGE_PORT);
}
