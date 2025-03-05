import {
  makeObservable,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
} from "mobx";

// huge queries init때 실행 되지 말고 실제로 해당 객체가 옵저빙 되었을때만 실행되게 하도록 하기 위해서 구현
export class AllTokenMapByChainIdentifierState {
  @observable.ref
  protected _map: Map<string, any> = new Map();

  constructor(onObserved: () => void, onUnobserved: () => void) {
    makeObservable(this);

    let i = 0;
    onBecomeObserved(this, "_map", () => {
      i++;
      if (i === 1) {
        onObserved();
      }
    });
    onBecomeUnobserved(this, "_map", () => {
      i--;
      if (i === 0) {
        onUnobserved();
      }
    });
  }

  get map(): Map<string, any> {
    return this._map;
  }

  set map(map: Map<string, any>) {
    this._map = map;
  }
}
