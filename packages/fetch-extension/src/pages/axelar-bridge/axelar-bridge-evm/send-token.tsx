/* eslint-disable import/no-extraneous-dependencies */
import { useNotification } from "@components/notification";
import React, { useState } from "react";
import { Button } from "reactstrap";
import { useStore } from "../../../stores";
import style from "../style.module.scss";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { formatActivityHash } from "@utils/format";

interface SendTokenProps {
  sendConfigs: any;
}

export const SendToken: React.FC<SendTokenProps> = observer(
  ({ sendConfigs }) => {
    const { chainStore, accountStore } = useStore();
    const current = chainStore.current;
    const accountInfo = accountStore.getAccount(current.chainId);
    const notification = useNotification();
    const navigate = useNavigate();
    const [isTrsnxInProgress, setIsTrsnxInProgress] = useState<boolean>(false);

    const sendConfigError =
      sendConfigs.recipientConfig.error ??
      sendConfigs.amountConfig.error ??
      sendConfigs.memoConfig.error ??
      sendConfigs.gasConfig.error ??
      sendConfigs.feeConfig.error;
    const txStateIsValid = sendConfigError == null;

    const handleEVMSendToken = async () => {
      if (txStateIsValid) {
        setIsTrsnxInProgress(true);
        try {
          const stdFee = sendConfigs.feeConfig.toStdFee();

          const tx = accountInfo.makeSendTokenTx(
            sendConfigs.amountConfig.amount,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            sendConfigs.amountConfig.sendCurrency!,
            sendConfigs.recipientConfig.recipient
          );

          await tx.send(
            stdFee,
            sendConfigs.memoConfig.memo,
            {
              preferNoSetFee: true,
              preferNoSetMemo: true,
            },
            {
              onBroadcastFailed: (e: any) => {
                console.log(e);
              },
              onBroadcasted: () => {
                notification.push({
                  type: "info",
                  placement: "top-center",
                  duration: 5,
                  content: `Transaction Broadcasted`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
                navigate("/axl-bridge-evm");
              },
              onFulfill: (e) => {
                console.log(e.transactionHash);
                notification.push({
                  type: "success",
                  placement: "top-center",
                  duration: 5,
                  content: `Transaction successful with hash: ${formatActivityHash(
                    e.transactionHash
                  )}`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
              },
            }
          );
          setIsTrsnxInProgress(false);
        } catch (e) {
          notification.push({
            type: "warning",
            placement: "top-center",
            duration: 5,
            content: `Fail to send token: ${e.message}`,
            canDelete: true,
            transition: {
              duration: 0.25,
            },
          });
          navigate("/axl-bridge-evm");
          setIsTrsnxInProgress(false);
        }
      }
    };

    return (
      <React.Fragment>
        {isTrsnxInProgress && (
          <div className={style["loader"]}>
            Transaction In Progress{" "}
            <i className="fas fa-spinner fa-spin ml-2" />
          </div>
        )}
        <Button
          type="submit"
          color="primary"
          style={{ width: "100%" }}
          onClick={handleEVMSendToken}
          disabled={isTrsnxInProgress || !txStateIsValid}
        >
          Send Token
        </Button>
        {sendConfigError ? (
          <div className={style["errorText"]}>{sendConfigError}</div>
        ) : null}
      </React.Fragment>
    );
  }
);
