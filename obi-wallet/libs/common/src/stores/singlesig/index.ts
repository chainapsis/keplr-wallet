import { computed, flow, makeObservable, observable } from "mobx";

export enum SinglesigState {
  LOADING,
  EMPTY,
  INITIALIZED,
}

export class SinglesigStore {
  @observable
  protected loading = false;

  constructor() {
    makeObservable(this);
    // this.init();
  }

  // @flow
  // protected *init() {}

  @computed
  public get state(): SinglesigState {
    if (this.loading) return SinglesigState.LOADING;
    return SinglesigState.EMPTY;
  }
}
