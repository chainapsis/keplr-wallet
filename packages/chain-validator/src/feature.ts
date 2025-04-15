import { ChainInfo } from "@keplr-wallet/types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

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
  "terra-classic-fee",
  "ibc-go-v7-hot-fix",
  "ibc-pfm",
  "authz-msg-revoke-fixed",
  "osmosis-base-fee-beta",
  "feemarket",
  "op-stack-l1-data-fee",
  "force-enable-evm-ledger",
  "ibc-v2",
  "evm-ledger-sign-plain-json",
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
    rpc: string,
    rest: string
  ) => Promise<boolean>;
}[] = [
  {
    feature: "ibc-go",
    fetch: async (_features, _rpc, rest) => {
      const response = await simpleFetch<{
        params: {
          receive_enabled: boolean;
          send_enabled: boolean;
        };
      }>(rest, "/ibc/apps/transfer/v1/params", {
        validateStatus: (status) => {
          return status === 200 || status === 501;
        },
      });

      return response.status === 200;
    },
  },
  {
    feature: "ibc-transfer",
    fetch: async (features, _rpc, rest) => {
      const requestUrl = features.includes("ibc-go")
        ? "/ibc/apps/transfer/v1/params"
        : "/ibc/applications/transfer/v1beta1/params";

      const result = await simpleFetch<{
        params: {
          receive_enabled: boolean;
          send_enabled: boolean;
        };
      }>(rest, requestUrl, {
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
    feature: "ibc-pfm",
    fetch: async (features, _rpc, rest) => {
      if (features.includes("ibc-go")) {
        const result = await simpleFetch(rest, "/ibc/apps/router/v1/params", {
          validateStatus: (status) => {
            return status === 200 || status === 501;
          },
        });

        if (result.status === 200) {
          return true;
        }

        const result2 = await simpleFetch(
          rest,
          "/ibc/apps/packetforward/v1/params",
          {
            validateStatus: (status) => {
              return status === 200 || status === 501;
            },
          }
        );

        if (result2.status === 200) {
          return true;
        }
      }

      return false;
    },
  },
  {
    feature: "wasmd_0.24+",
    fetch: async (features, _rpc, rest) => {
      if (features.includes("cosmwasm")) {
        const result = await simpleFetch(
          rest,
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
    fetch: async (_features, _rpc, rest) => {
      const result = await simpleFetch(
        rest,
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
  {
    feature: "feemarket",
    fetch: async (_features, _rpc, rest) => {
      const result = await simpleFetch<{
        params: {
          enabled: boolean;
        };
      }>(rest, "/feemarket/v1/params");

      return result.data.params.enabled;
    },
  },
  {
    feature: "ibc-v2",
    fetch: async (features, _rpc, rest) => {
      if (!features.includes("ibc-go")) {
        return false;
      }
      const result = await simpleFetch<{
        code: number;
        message: string;
        details: string[];
      }>(rest, "/ibc/apps/transfer/v1/denoms/test", {
        validateStatus: (status) => {
          return status === 400;
        },
      });

      if (
        result.status === 400 &&
        result.data?.message &&
        typeof result.data.message === "string" &&
        result.data.message.includes("invalid denom trace hash")
      ) {
        return true;
      }

      return false;
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

  for (const method of RecognizableChainFeaturesMethod) {
    if (features.includes(method.feature)) {
      continue;
    }

    try {
      if (await method.fetch(features, chainInfo.rpc, chainInfo.rest)) {
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

  return method.fetch(
    chainInfo.features?.slice() ?? [],
    chainInfo.rpc,
    chainInfo.rest
  );
}
