import { useEffect, useState } from "react";

import {
  ApproveTxBuilderConfigMsg,
  GetRequestedTxBuilderConfigMsg,
  RejectTxBuilderConfigMsg
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
 * @param id Id of requested tx builder config.
 * @param onConfigInit Callback when config initialized. Make sure that onConfigInit should not make re-render unnecessarily by using useCallback.
 * @param onApprove Callback when approving succeeds. Make sure that onApprove should not make re-render unnecessarily by using useCallback.
 */
export const useTxBuilderConfig = (
  id: string,
  onConfigInit: (chainId: string, config: TxBuilderConfig) => void,
  onApprove: () => void
) => {
  const [initializing, setInitializing] = useState(false);
  const [config, setConfig] = useState<TxBuilderConfig | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // If index is empty, do nothing.
      if (!id) {
        return;
      }

      if (isMounted) {
        setInitializing(true);
      }

      const msg = new GetRequestedTxBuilderConfigMsg(id);
      try {
        const result = await sendMessage(BACKGROUND_PORT, msg);

        const config = txBuilderConfigFromPrimitive(result.config);
        if (isMounted) {
          setConfig(config);
        }
        onConfigInit(result.config.chainId, config);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [approve, setApprove] = useState<
    ((config: TxBuilderConfig) => Promise<void>) | undefined
  >(undefined);

  const [reject, setReject] = useState<(() => Promise<void>) | undefined>();

  useEffect(() => {
    if (requested) {
      setRequested(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const appove = async (config: TxBuilderConfig) => {
      if (isMounted) {
        setLoading(true);
        setRequested(true);
      }

      try {
        const configPrimitive = txBuilderConfigToPrimitive(config);
        const msg = new ApproveTxBuilderConfigMsg(id, configPrimitive);
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

    const reject = async () => {
      if (isMounted) {
        setLoading(true);
        setRequested(true);
      }

      try {
        const msg = new RejectTxBuilderConfigMsg(id);
        await sendMessage(BACKGROUND_PORT, msg);
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
    setReject(() => reject);

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    initializing,
    config,
    loading,
    requested,
    error,
    approve,
    reject
  };
};
