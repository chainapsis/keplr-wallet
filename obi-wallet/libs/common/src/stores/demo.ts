import { action, makeObservable, observable } from "mobx";

import { MultisigState } from "./multisig";

export class DemoStore {
  @observable
  public demoMode = false;

  @observable
  public demoState = MultisigState.EMPTY;

  constructor() {
    makeObservable(this);
  }

  @action
  public toggleDemoMode() {
    this.demoMode = !this.demoMode;
    this.demoState = MultisigState.EMPTY;
  }

  @action
  public finishOnboarding() {
    this.demoState = MultisigState.INITIALIZED;
  }

  @action
  public logout() {
    this.demoState = MultisigState.EMPTY;
  }
}
