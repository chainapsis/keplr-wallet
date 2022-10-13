import { makeObservable, observable } from "mobx";

import { AbstractWallet } from "./abstract-wallet";
import { SerializedMultisigWallet } from "./serialized-data";

export class MultisigWallet extends AbstractWallet {
  @observable
  protected serializedData: SerializedMultisigWallet;

  constructor({
    serializedData,
  }: {
    serializedData: SerializedMultisigWallet;
  }) {
    super();
    this.serializedData = serializedData;
    makeObservable(this);
  }

  public get address() {
    return null;
  }

  public get type() {
    return "multisig" as const;
  }
}
