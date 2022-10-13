import { makeObservable, observable } from "mobx";

import { SerializedMultisigWallet } from "./serialized-data";

export class MultisigWallet {
  @observable
  protected serializedData: SerializedMultisigWallet;

  constructor({
    serializedData,
  }: {
    serializedData: SerializedMultisigWallet;
  }) {
    this.serializedData = serializedData;
    makeObservable(this);
  }
}
