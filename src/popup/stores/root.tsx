import { ChainStore } from "./chain";
import { KeyRingStore } from "./keyring";
import { AccountStore } from "./account";

export class RootStore {
  constructor(
    public chainStore: ChainStore,
    public keyRingStore: KeyRingStore,
    public accountStore: AccountStore
  ) {}
}

export function createRootStore(
  keyRingStore: KeyRingStore,
  accountStore: AccountStore
) {
  return new RootStore(
    new ChainStore(keyRingStore, accountStore),
    keyRingStore,
    accountStore
  );
}
