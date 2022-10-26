import { ChainInfo } from "@keplr-wallet/types";
import Axios from "axios";

// CheckInfo for checking
export type chainInfoForCheck = Pick<ChainInfo, "rest" | "features">;

/**
 * Returns features that chain will have to update
 * @param chainInfo
 */
export async function checkChainFeatures(
  chainInfo: chainInfoForCheck
): Promise<string[]> {
  // deep copy
  const copiedChainInfo: chainInfoForCheck = JSON.parse(
    JSON.stringify(chainInfo)
  );

  const features = [
    "ibc-go",
    "ibc-transfer",
    "wasmd_0.24+",
    "query:/cosmos/bank/v1beta1/spendable_balances",
  ];

  for (const feature of features) {
    // Skip if it's already supported
    if (!copiedChainInfo.features?.includes(feature)) {
      const featureString = await hasFeature(copiedChainInfo, feature);

      if (featureString) {
        (copiedChainInfo.features ?? []).push(featureString);
      }
    }
  }

  // different between raw features and copiedFeature
  return (copiedChainInfo.features ?? []).filter(
    (item) => !chainInfo.features?.includes(item)
  );
}

export async function hasFeature(
  chainInfo: Readonly<chainInfoForCheck>,
  featureString: string
): Promise<string | undefined> {
  let requestUrl: string = "";

  try {
    // If there isn't features in chainInfo
    // Or there isn't featureString in features
    if (!chainInfo.features || !chainInfo.features.includes(featureString)) {
      // initialize rest api instance
      const restInstance = Axios.create({
        baseURL: chainInfo.rest,
      });

      switch (featureString) {
        case "ibc-go": {
          requestUrl = "/ibc/apps/transfer/v1/params";
          const response = await restInstance.get<{
            params: {
              receive_enabled: boolean;
              send_enabled: boolean;
            };
          }>(requestUrl);

          if (response.status === 200) {
            return featureString;
          }

          return undefined;
        }
        case "ibc-transfer": {
          requestUrl = chainInfo.features?.includes("ibc-go")
            ? "/ibc/apps/transfer/v1/params"
            : "/ibc/applications/transfer/v1beta1/params";

          const result = await restInstance.get<{
            params: {
              receive_enabled: boolean;
              send_enabled: boolean;
            };
          }>(requestUrl);

          if (
            result.data.params.receive_enabled &&
            result.data.params.send_enabled
          ) {
            return featureString;
          }

          return undefined;
        }
        case "wasmd_0.24+": {
          if (chainInfo.features?.includes("cosmwasm")) {
            requestUrl = "/cosmwasm/wasm/v1/contract/test/smart/test";

            const result = await restInstance.get(requestUrl, {
              validateStatus: (status) => {
                return status === 400 || status === 501;
              },
            });
            if (result.status === 400) {
              return featureString;
            }
          }

          return undefined;
        }
        case "query:/cosmos/bank/v1beta1/spendable_balances": {
          requestUrl = "/cosmos/bank/v1beta1/spendable_balances/test";

          const result = await restInstance.get(requestUrl, {
            validateStatus: (status) => {
              return status === 400 || status === 501;
            },
          });
          if (result.status === 400) {
            return featureString;
          }

          return undefined;
        }
      }
    }
  } catch {
    throw new Error(`Failed to get response ${requestUrl} from lcd endpoint`);
  }

  return undefined;
}
