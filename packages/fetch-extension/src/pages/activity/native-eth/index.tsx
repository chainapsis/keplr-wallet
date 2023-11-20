import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useStore } from "../../../stores";
import style from "./style.module.scss";
import sendIcon from "@assets/icon/send-grey.png";
import pendingIcon from "@assets/icon/awaiting.png";
import success from "@assets/icon/success.png";
import cancel from "@assets/icon/cancel.png";
import prohibition from "@assets/icon/prohibition.png";
import contractIcon from "@assets/icon/contract-grey.png";
import { ITxn } from "@keplr-wallet/stores";
import { Button, Modal, ModalBody } from "reactstrap";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { useNotification } from "@components/notification";

const TransactionItem: FunctionComponent<{
  transactionInfo: ITxn;
  setCancelOpen: React.Dispatch<React.SetStateAction<string>>;
  setSpeedUpOpen: React.Dispatch<React.SetStateAction<string>>;
  queued?: boolean;
}> = ({ transactionInfo, setCancelOpen, setSpeedUpOpen, queued }) => {
  const { chainStore } = useStore();
  const intl = useIntl();

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "success":
        return success;
      case "pending":
        return pendingIcon;
      case "cancelled":
        return prohibition;
      case "failed":
        return cancel;
      default:
        return cancel;
    }
  };

  const getActivityIcon = (type: string | undefined): string => {
    switch (type) {
      case "Send":
        return sendIcon;
      case "ContractInteraction":
        return contractIcon;
      default:
        return contractIcon;
    }
  };

  const displaySpeedupCancelButtons = () => {
    let showSpeedUp = false;
    if (transactionInfo.lastSpeedUpAt) {
      const currentTime = new Date().getTime();
      const lastSpeedUpTime = new Date(transactionInfo.lastSpeedUpAt).getTime();
      showSpeedUp = (currentTime - lastSpeedUpTime) / 1000 >= 10;
    }

    return (
      <div>
        {transactionInfo.cancelled && (
          <div className={style["activityCol"]}>
            {" "}
            Cancellation in progress{" "}
            <i className="fas fa-spinner fa-spin ml-2" />{" "}
          </div>
        )}
        <div className={style["buttonRow"]}>
          {!transactionInfo.cancelled && (
            <div className={style["buttonCol"]}>
              <Button
                size="sm"
                style={{ width: "auto" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCancelOpen(transactionInfo.hash);
                }}
                color="primary"
              >
                {intl.formatMessage({
                  id: "send.button.cancel",
                })}
              </Button>
            </div>
          )}
          {showSpeedUp && (
            <div
              className={style["buttonCol"]}
              style={{
                width: "auto",
              }}
            >
              <Button
                size="sm"
                style={{ width: "auto" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSpeedUpOpen(transactionInfo.hash);
                }}
                outline
                color="primary"
              >
                {transactionInfo.cancelled
                  ? "Speed up cancellation"
                  : intl.formatMessage({
                      id: "send.button.speedup",
                    })}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const displayActivity = (status: string, amount: string | undefined) => {
    return (
      <div className={style["activityRow"]}>
        <div className={style["activityCol"]} style={{ width: "15%" }}>
          <img
            src={getActivityIcon(transactionInfo.type)}
            alt={transactionInfo.type}
          />
        </div>
        <div
          className={style["activityCol"]}
          style={{ width: "40%", overflow: "hidden" }}
        >
          {transactionInfo.type}
        </div>
        <div className={style["activityCol"]} style={{ width: "46%" }}>
          {amount + " " + transactionInfo.symbol}
        </div>
        <div className={style["activityCol"]} style={{ width: "7%" }}>
          <img
            style={{ height: "22px" }}
            src={getStatusIcon(status)}
            alt={status}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className={style["activityContainer"]}
      onClick={(e) => {
        e.preventDefault();
        if (chainStore.current.explorerUrl) {
          window.open(
            chainStore.current.explorerUrl + "/tx/" + transactionInfo.hash,
            "_blank",
            "noreferrer"
          );
        }
      }}
    >
      {displayActivity(transactionInfo.status, transactionInfo.amount)}
      {queued && <div className={style["activityCol"]}>Queued</div>}
      {transactionInfo.status === "pending" &&
        !queued &&
        displaySpeedupCancelButtons()}
    </div>
  );
};

export const NativeEthTab = () => {
  const { chainStore, accountStore } = useStore();
  const [hashList, setHashList] = useState<ITxn[]>([]);
  const [cancelOpen, setCancelOpen] = useState<string>("");
  const [speedUpOpen, setSpeedUpOpen] = useState<string>("");
  const notification = useNotification();
  const navigate = useNavigate();
  const timer = useRef<NodeJS.Timer>();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const refreshTxList = async () => {
    if (!window.location.href.includes("#/activity") && timer.current) {
      clearInterval(timer.current);
      return;
    }

    let txList = await accountInfo.ethereum.getTxList();
    setHashList(txList);

    await Promise.all(
      txList.map(async (txData, _) => {
        if (txData.status === "pending") {
          await accountInfo.ethereum.checkAndUpdateTransactionStatus(
            txData.hash
          );
          txList = await accountInfo.ethereum.getTxList();
          setHashList(txList);
        }
      })
    );
  };

  useEffect(() => {
    if (!accountInfo.ethereumHexAddress) {
      return;
    }

    refreshTxList();
    if (!timer.current) {
      timer.current = setInterval(() => refreshTxList(), 5000);
    }
  }, [accountInfo.ethereumHexAddress, chainStore.current.chainId]);

  return (
    <React.Fragment>
      <Modal
        centered
        isOpen={cancelOpen !== ""}
        toggle={() => {
          setCancelOpen("");
        }}
      >
        <ModalBody>
          <div style={{ fontSize: "small", marginBottom: "5px" }}>
            Cancelling the transaction by increasing the current gas price by
            15%. Note that this action is irreversible as the original
            transaction will be replaced.
          </div>
          <Button
            size="sm"
            style={{ width: "100%" }}
            onClick={async (e) => {
              e.preventDefault();
              try {
                await accountInfo.ethereum.cancelTransactionAndBroadcast(
                  cancelOpen
                );
              } catch (e) {
                console.error(e);
                notification.push({
                  type: "warning",
                  placement: "top-center",
                  duration: 5,
                  content: `Could not cancel transaction. Please try later`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
              } finally {
                navigate("/activity");
              }
            }}
            color="primary"
          >
            Proceed
          </Button>
        </ModalBody>
      </Modal>
      <Modal
        centered
        isOpen={speedUpOpen !== ""}
        toggle={() => {
          setSpeedUpOpen("");
        }}
      >
        <ModalBody>
          <div style={{ fontSize: "small", marginBottom: "5px" }}>
            Speeding up the transaction by increasing the current gas price by
            15%.
          </div>
          <Button
            size="sm"
            style={{ width: "100%" }}
            onClick={async (e) => {
              e.preventDefault();
              try {
                await accountInfo.ethereum.speedUpTransactionAndBroadcast(
                  speedUpOpen
                );
              } catch (e) {
                console.error(e);
                notification.push({
                  type: "warning",
                  placement: "top-center",
                  duration: 5,
                  content: `Could not speed up transaction. Please try later`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
              } finally {
                navigate("/activity");
              }
            }}
            color="primary"
          >
            Proceed
          </Button>
        </ModalBody>
      </Modal>
      {hashList.length > 0 ? (
        <div>
          {hashList.map((transactionInfo, index) => (
            <TransactionItem
              key={index}
              transactionInfo={transactionInfo}
              setCancelOpen={setCancelOpen}
              setSpeedUpOpen={setSpeedUpOpen}
              queued={
                index < hashList.length - 1 &&
                hashList[index + 1].status === "pending"
              }
            />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}> No activity </p>
      )}
    </React.Fragment>
  );
};
