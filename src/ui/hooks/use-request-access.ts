import { useEffect, useState } from "react";

import { sendMessage } from "../../common/message";
import { BACKGROUND_PORT } from "../../common/message/constant";
import { AccessOrigin } from "../../background/chains";
import {
  ApproveAccessMsg,
  GetReqeustAccessDataMsg,
  RejectAccessMsg
} from "../../background/chains/messages";

export const useRequestAccess = (
  id: string,
  onAccessOriginInit: (accessOrigin: AccessOrigin) => void
) => {
  const [initializing, setInitializing] = useState(false);
  const [accessOrigin, setAccessOrigin] = useState<AccessOrigin | undefined>();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
        setInitializing(true);
      }

      const msg = new GetReqeustAccessDataMsg(id);
      try {
        const result = await sendMessage(BACKGROUND_PORT, msg);

        if (isMounted) {
          onAccessOriginInit(result);
        }

        if (isMounted) {
          setAccessOrigin(result);
        }
      } catch (e) {
        if (isMounted) {
          setAccessOrigin(undefined);
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
    // Make sure that onAccessOriginInit should not make re-render unnecessarily by using useCallback.
  }, [id, onAccessOriginInit]);

  const [approve, setApprove] = useState<(() => Promise<void>) | undefined>(
    undefined
  );
  const [reject, setReject] = useState<(() => Promise<void>) | undefined>(
    undefined
  );

  useEffect(() => {
    let isMounted = true;
    if (loading) {
      setLoading(false);
    }
    if (requested) {
      setRequested(false);
    }

    const appove = async () => {
      if (isMounted) {
        setLoading(true);
        setRequested(true);
      }

      try {
        const msg = new ApproveAccessMsg(id);
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

    const reject = async () => {
      if (isMounted) {
        setLoading(true);
        setRequested(true);
      }

      try {
        const msg = new RejectAccessMsg(id);
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
    id,
    initializing,
    accessOrigin,
    loading,
    requested,
    error,
    approve,
    reject
  };
};
