import { ChainInfo } from "@keplr-wallet/types";
import Axios, { AxiosInstance } from "axios";

/**
 * Indicate the features which keplr supports.
 */
export const SupportedChainFeatures = [
  "stargate",
  "cosmwasm",
  "wasmd_0.24+",
  "secretwasm",
  "ibc-transfer",
  "no-legacy-stdTx",
  "ibc-go",
  "eth-address-gen",
  "eth-key-sign",
  "query:/cosmos/bank/v1beta1/spendable_balances",
  "axelar-evm-bridge",
  "osmosis-txfees",
];

/**
 * Describe the way to know whether that feature is needed.
 * This is used in `checkChainFeatures` function.
 * `checkChainFeatures` function iterate this constant
 * and execute method in sequence
 * and if it returns "true", it pushes that feature and deliver it to next method.
 * So, the order is important.
 */
export const RecognizableChainFeaturesMethod: {
  feature: string;
  fetch: (
    features: ReadonlyArray<string>,
    rpcInstance: AxiosInstance,
    restInstance: AxiosInstance
  ) => Promise<boolean>;
}[] = [
  {
    feature: "ibc-go",
    fetch: async (_features, _rpcInstance, restInstance) => {
      const response = await restInstance.get<{
        params: {
          receive_enabled: boolean;
          send_enabled: boolean;
        };
      }>("/ibc/apps/transfer/v1/params", {
        validateStatus: (status) => {
          return status === 200 || status === 501;
        },
      });

      return response.status === 200;
    },
  },
  {
    feature: "ibc-transfer",
    fetch: async (features, _rpcInstance, restInstance) => {
      const requestUrl = features.includes("ibc-go")
        ? "/ibc/apps/transfer/v1/params"
        : "/ibc/applications/transfer/v1beta1/params";

      const result = await restInstance.get<{
        params: {
          receive_enabled: boolean;
          send_enabled: boolean;
        };
      }>(requestUrl, {
        validateStatus: (status) => {
          return status === 200 || status === 501;
        },
      });

      return (
        result.status === 200 &&
        result.data.params.receive_enabled &&
        result.data.params.send_enabled
      );
    },
  },
  {
    feature: "wasmd_0.24+",
    fetch: async (features, _rpcInstance, restInstance) => {
      if (features.includes("cosmwasm")) {
        const result = await restInstance.get(
          "/cosmwasm/wasm/v1/contract/test/smart/test",
          {
            validateStatus: (status) => {
              return status === 400 || status === 501;
            },
          }
        );
        if (result.status === 400) {
          return true;
        }
      }
      return false;
    },
  },
  {
    feature: "query:/cosmos/bank/v1beta1/spendable_balances",
    fetch: async (_features, _rpcInstance, restInstance) => {
      const result = await restInstance.get(
        "/cosmos/bank/v1beta1/spendable_balances/test",
        {
          validateStatus: (status) => {
            return status === 400 || status === 501;
          },
        }
      );
      return result.status === 400;
    },
  },
];

/**
 * Indicate the features which keplr can know whether that feature is needed.
 */
export const RecognizableChainFeatures = RecognizableChainFeaturesMethod.map(
  (method) => method.feature
);

export const NonRecognizableChainFeatures: string[] = (() => {
  const m: Record<string, boolean | undefined> = {};

  for (const feature of RecognizableChainFeatures) {
    m[feature] = true;
  }

  const r: string[] = [];

  for (const feature of SupportedChainFeatures) {
    if (!m[feature]) {
      r.push(feature);
    }
  }

  return r;
})();

// CheckInfo for checking
export type ChainInfoForCheck = Pick<ChainInfo, "rpc" | "rest" | "features">;

/**
 * Returns features that chain will have to update
 * @param chainInfo
 */
export async function checkChainFeatures(
  chainInfo: ChainInfoForCheck
): Promise<string[]> {
  const newFeatures: string[] = [];
  const features = chainInfo.features?.slice() ?? [];
  const rpcInstance = Axios.create({
    baseURL: chainInfo.rpc,
  });
  const restInstance = Axios.create({
    baseURL: chainInfo.rest,
  });

  for (const method of RecognizableChainFeaturesMethod) {
    if (features.includes(method.feature)) {
      continue;
    }

    try {
      if (await method.fetch(features, rpcInstance, restInstance)) {
        newFeatures.push(method.feature);
        features.push(method.feature);
      }
    } catch (e) {
      console.log(
        `Failed to try to fetch feature (${method.feature}): ${e.message || e}`
      );
    }
  }

  return newFeatures;
}

export async function hasFeature(
  chainInfo: Readonly<ChainInfoForCheck>,
  feature: string
): Promise<boolean> {
  if (chainInfo.features?.includes(feature)) {
    return true;
  }

  const method = RecognizableChainFeaturesMethod.find(
    (m) => m.feature === feature
  );
  if (!method) {
    throw new Error(`${feature} not exist on RecognizableChainFeaturesMethod`);
  }

  const rpcInstance = Axios.create({
    baseURL: chainInfo.rpc,
  });
  const restInstance = Axios.create({
    baseURL: chainInfo.rest,
  });

  return method.fetch(
    chainInfo.features?.slice() ?? [],
    rpcInstance,
    restInstance
  );
}
