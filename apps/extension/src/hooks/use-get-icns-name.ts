import { useStore } from "../stores";

export const useGetIcnsName = (bech32Address?: string) => {
  const { uiConfigStore, chainStore, queriesStore } = useStore();
  const icnsPrimaryName = (() => {
    if (
      uiConfigStore.icnsInfo &&
      chainStore.hasChain(uiConfigStore.icnsInfo.chainId) &&
      bech32Address
    ) {
      const queries = queriesStore.get(uiConfigStore.icnsInfo.chainId);
      const icnsQuery = queries.icns.queryICNSNames.getQueryContract(
        uiConfigStore.icnsInfo.resolverContractAddress,
        bech32Address
      );

      return icnsQuery.primaryName.split(".")[0];
    }
  })();

  return icnsPrimaryName;
};
