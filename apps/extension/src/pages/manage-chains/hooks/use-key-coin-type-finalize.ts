import { useStore } from "../../../stores";
import { useCallback } from "react";
import { IChainInfoImpl } from "@keplr-wallet/stores";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";

export function useKeyCoinTypeFinalize() {
  const { keyRingStore, queriesStore } = useStore();

  const needFinalizeKeyCoinTypeAction = useCallback(
    async (
      vaultId: string,
      chainInfo: IChainInfoImpl<ChainInfoWithCoreTypes>
    ) => {
      const queries = queriesStore.get(chainInfo.chainId);

      if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
        const candidateAddress =
          await keyRingStore.computeNotFinalizedKeyAddresses(
            vaultId,
            chainInfo.chainId
          );

        if (candidateAddress.length === 1) {
          // finalize-key scene을 통하지 않고도 이 scene으로 들어올 수 있는 경우가 있기 때문에...
          keyRingStore.finalizeKeyCoinType(
            vaultId,
            chainInfo.chainId,
            candidateAddress[0].coinType
          );
          return false;
        }
        if (candidateAddress.length >= 2) {
          const result = await (async () => {
            const promises: Promise<unknown>[] = [];

            for (const candidate of candidateAddress) {
              const queryAccount =
                queries.cosmos.queryAccount.getQueryBech32Address(
                  candidate.bech32Address
                );

              promises.push(queryAccount.waitResponse());
            }

            await Promise.allSettled(promises);

            const mainAddress = candidateAddress.find(
              (a) => a.coinType === chainInfo.bip44.coinType
            );
            const otherAddresses = candidateAddress.filter(
              (a) => a.coinType !== chainInfo.bip44.coinType
            );

            let otherIsSelectable = false;
            if (mainAddress && otherAddresses.length > 0) {
              for (const otherAddress of otherAddresses) {
                const bech32Address = otherAddress.bech32Address;
                const queryAccount =
                  queries.cosmos.queryAccount.getQueryBech32Address(
                    bech32Address
                  );

                // Check that the account exist on chain.
                // With stargate implementation, querying account fails with 404 status if account not exists.
                // But, if account receives some native tokens, the account would be created and it may deserve to be chosen.
                if (queryAccount.response?.data && queryAccount.error == null) {
                  otherIsSelectable = true;
                  break;
                }
              }
            }

            if (!otherIsSelectable && mainAddress) {
              keyRingStore.finalizeKeyCoinType(
                vaultId,
                chainInfo.chainId,
                mainAddress.coinType
              );
              return false;
            } else {
              return true;
            }
          })();

          return result;
        }
      }

      return false;
    },
    [keyRingStore, queriesStore]
  );

  return { needFinalizeKeyCoinTypeAction };
}
