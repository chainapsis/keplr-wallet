import { action, makeObservable, observable } from "mobx";
import { useRef } from "react";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

// XXX: 좀 이상하긴 한데 상위/하위 컴포넌트가 state를 공유하기 쉽게하려고 이렇게 한다...
export class ClaimAllEachState {
  @observable
  isLoading: boolean = false;

  @observable
  isSimulating: boolean = false;
  @observable
  failedReason: Error | undefined = undefined;

  constructor() {
    makeObservable(this);
  }

  @action
  setIsLoading(value: boolean): void {
    this.isLoading = value;
  }

  @action
  setIsSimulating(value: boolean): void {
    this.isSimulating = value;
  }

  @action
  setFailedReason(value: Error | undefined): void {
    this.isLoading = false;
    this.failedReason = value;
  }
}

export const useClaimAllEachState = () => {
  const statesRef = useRef(new Map<string, ClaimAllEachState>());
  const getClaimAllEachState = (chainId: string): ClaimAllEachState => {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

    let state = statesRef.current.get(chainIdentifier);
    if (!state) {
      state = new ClaimAllEachState();
      statesRef.current.set(chainIdentifier, state);
    }

    return state;
  };

  return {
    states: statesRef.current.values(),
    getClaimAllEachState,
  };
};
