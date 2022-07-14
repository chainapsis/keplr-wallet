import { RootStore } from "@obi-wallet/common";

const rootStore = new RootStore();

export function useStore() {
  return rootStore;
}
