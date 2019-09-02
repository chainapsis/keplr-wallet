import { ChainStore } from "./chain";
import { KeyRing } from "./keyring";

export class RootStore {
  constructor(public chainStore: ChainStore) {}
}

export function createRootStore(keyRing: KeyRing) {
  return new RootStore(new ChainStore(keyRing));
}
