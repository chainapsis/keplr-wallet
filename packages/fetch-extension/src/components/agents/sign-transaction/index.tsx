import { useNotification } from "@components/notification";
import { deliverMessages } from "@graphQL/messages-api";
import { signTransaction } from "@utils/sign-transaction";
import React from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AGENT_ADDRESS,
  TRANSACTION_FAILED,
  TRANSACTION_SIGNED,
} from "../../../config.ui.var";
import { useStore } from "../../../stores";
import style from "./style.module.scss";
import { Button } from "reactstrap";

export const SignTransaction = ({
  rawText,
  chainId,
  disabled,
}: {
  rawText: string;
  chainId: string;
  disabled: boolean;
}) => {
  const { chainStore, accountStore, chatStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const navigate = useNavigate();
  const targetAddress = useLocation().pathname.split("/")[3];

  const user = chatStore.userDetailsStore;
  const notification = useNotification();
  const signTxn = async (data: string) => {
    try {
      const signResult = await signTransaction(data, chainId, accountInfo);
      navigate(-1);
      await deliverMessages(
        user.accessToken,
        chainId,
        {
          message: TRANSACTION_SIGNED,
          signedTx: Buffer.from(signResult.signedTx).toString("base64"),
          signature: signResult.signature.signature,
        },
        accountInfo.bech32Address,
        targetAddress,
        chatStore.messagesStore
      );
    } catch (e) {
      console.log(e);
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: `Failed to execute Transaction`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
      await deliverMessages(
        user.accessToken,
        chainId,
        TRANSACTION_FAILED,
        accountInfo.bech32Address,
        targetAddress,
        chatStore.messagesStore
      );
      navigate(`/chat/agent/${AGENT_ADDRESS[current.chainId]}`);
    }
  };

  const cancel = async () => {
    try {
      await deliverMessages(
        user.accessToken,
        current.chainId,
        "/cancel",
        accountInfo.bech32Address,
        targetAddress,
        chatStore.messagesStore
      );
    } catch (e) {
      console.log(e);
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: `Failed to cancel Operation`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
  };

  return (
    <div className={style["message"]}>
      Please recheck parameters of the transaction in Data Tab before approving
      the transaction.
      <Button
        type="button"
        color="primary"
        size="sm"
        disabled={disabled}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          marginTop: "10px",
        }}
        onClick={() => signTxn(rawText)}
      >
        Sign transaction
      </Button>
      <Button
        type="button"
        color="secondary"
        size="sm"
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          marginTop: "10px",
        }}
        disabled={disabled}
        onClick={() => cancel()}
      >
        Cancel
      </Button>
    </div>
  );
};
