import { useEffect, useState } from "react";

import {
  ApproveTxBuilderConfigMsg,
  GetRequestedTxBuilderConfigMsg
} from "../../background/keyring";
import { sendMessage } from "../../common/message";
import { BACKGROUND_PORT } from "../../common/message/constant";

import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import {
  txBuilderConfigFromPrimitive,
  txBuilderConfigToPrimitive
} from "../../background/keyring/utils";

/**
 * useTxBuilderConfig hook returns the object related to cosmosjs's tx builder config
 * This will not make a state transaction after unmounted.
 * `initiailizing` means if requested config is initializing.
 * `config` is the initialized config.
 * `loading` means if approving is requesting.
 * `error` is the thrown error during approving.
 * @param chainId Chain id of requested tx builder config.
 * @param onConfigInit Callback when config initialized. Make sure that onConfigInit should not make re-render every time by using useCallback.
 * @param onApprove Callback when approving succeeds. Make sure that onApprove should not make re-render every time by using useCallback.
 */
export const useTxBuilderConfig = (
  chainId: string,
  onConfigInit: (config: TxBuilderConfig) => void,
  onApprove: () => void
) => {
  const [initializing, setInitializing] = useState(false);
  const [config, setConfig] = useState<TxBuilderConfig | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // If chain id is empty, do nothing.
      if (!chainId) {
        return;
      }

      if (isMounted) {
        setInitializing(true);
      }

      const msg = GetRequestedTxBuilderConfigMsg.create(chainId);
      try {
        const result = await sendMessage(BACKGROUND_PORT, msg);

        const config = txBuilderConfigFromPrimitive(result.config);
        if (isMounted) {
          setConfig(config);
        }
        onConfigInit(config);
      } catch (e) {
        if (isMounted) {
          setConfig(undefined);
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
    // Make sure that onConfigInit should not make re-render every time by using useCallback.
  }, [chainId, onConfigInit]);

  const [approve, setApprove] = useState<
    ((config: TxBuilderConfig) => Promise<void>) | undefined
  >(undefined);

  useEffect(() => {
    let isMounted = true;

    const appove = async (config: TxBuilderConfig) => {
      if (isMounted) {
        setLoading(true);
      }

      try {
        const configPrimitive = txBuilderConfigToPrimitive(config);
        const msg = ApproveTxBuilderConfigMsg.create({
          chainId,
          ...configPrimitive
        });
        await sendMessage(BACKGROUND_PORT, msg);
        onApprove();
      } catch (e) {
        if (isMounted) {
          setError(e);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setApprove(() => appove);

    return () => {
      isMounted = false;
    };
  }, [chainId, onApprove]);

  return {
    initializing,
    config,
    loading,
    error,
    approve
  };
};
