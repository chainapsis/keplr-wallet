import { useStore } from "../../stores";
import { ClaimAllEachState } from "../../stores/claim-rewards-state";

export const useClaimAllEachState = () => {
  const { claimRewardsStateStore } = useStore();

  const getClaimAllEachState = (chainId: string): ClaimAllEachState => {
    return claimRewardsStateStore.get(chainId);
  };

  return {
    states: claimRewardsStateStore.values(),
    getClaimAllEachState,
  };
};
