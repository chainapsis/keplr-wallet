import { ChainStore } from "./chain";
import { KeyRingStore } from "./keyring";

export class RootStore {
  constructor(
    public chainStore: ChainStore,
    public keyRingStore: KeyRingStore
  ) {}
}

export function createRootStore(keyRingStore: KeyRingStore) {
  return new RootStore(new ChainStore(keyRingStore), keyRingStore);
}
