import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { Button } from "../../../components/button";
import {
  ApproveSignMsg,
  GetRequestedMessage,
  RejectSignMsg
} from "../../../../background/keyring";
import { RouteComponentProps } from "react-router";
import { sendMessage } from "../../../../common/message";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

import { HeaderLayout } from "../../layouts";

import style from "./styles.module.scss";

import queryString from "query-string";
import { useStore } from "../../stores";

const Buffer = require("buffer/").Buffer;

const approve = async (index: string) => {
  const msg = ApproveSignMsg.create(index);
  try {
    await sendMessage(BACKGROUND_PORT, msg);
  } catch (e) {
    if (e.toString() !== "Error: Unknown request index") {
      throw e;
    }
  }
};

const reject = async (index: string) => {
  const msg = RejectSignMsg.create(index);
  try {
    await sendMessage(BACKGROUND_PORT, msg);
  } catch (e) {
    if (e.toString() !== "Error: Unknown request index") {
      throw e;
    }
  }
};

export const SignPage: FunctionComponent<
  RouteComponentProps<{ index: string }>
> = ({ history, match, location }) => {
  const query = queryString.parse(location.search);
  const inPopup = query.inPopup as boolean | undefined;

  const index = match.params.index;

  const [selected, setSelected] = useState(false);
  const [message, setMessage] = useState("");

  const { chainStore } = useStore();

  useEffect(() => {
    // Force reject when closing window.
    const beforeunload = () => {
      if (!selected) {
        reject(index);
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);

      // If this is called by injected wallet provider, it will reject signing when unmount
      if (!inPopup && !selected) {
        reject(index);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const msg = GetRequestedMessage.create(index);
      const result = await sendMessage(BACKGROUND_PORT, msg);

      chainStore.setChain(result.chainId);
      const message = Buffer.from(result.messageHex, "hex").toString();

      try {
        setMessage(JSON.stringify(JSON.parse(message), undefined, 2));
      } catch (e) {
        setMessage(message);
      }
    })();

    // When index is changed, reject a prior request index.
    return () => {
      if (index && !selected) {
        // Ignore result.
        reject(index);
      }
    };
  }, [index]);

  const onApproveClick = useCallback(async () => {
    setSelected(true);
    await approve(index);

    // If this is called by injected wallet provider. Just close.
    if (!inPopup) {
      window.close();
    }
  }, [index, inPopup]);

  const onRejectClick = useCallback(async () => {
    setSelected(true);
    await reject(index);

    // If this is called by injected wallet provider. Just close.
    if (!inPopup) {
      window.close();
    }
  }, [index, inPopup]);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      onBackButton={
        inPopup
          ? () => {
              history.goBack();
            }
          : undefined
      }
    >
      <div>
        <pre className={style.message}>{message}</pre>
        <div className={style.buttons}>
          <Button
            className={style.button}
            size="medium"
            color="primary"
            disabled={selected}
            onClick={onApproveClick}
          >
            Approve
          </Button>
          <Button
            className={style.button}
            size="medium"
            color="danger"
            disabled={selected}
            onClick={onRejectClick}
          >
            Reject
          </Button>
        </div>
      </div>
    </HeaderLayout>
  );
};
