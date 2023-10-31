import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useStore } from "../../../stores";
import style from "./style.module.scss";
import sendIcon from "@assets/icon/send-grey.png";
import pendingIcon from "@assets/icon/awaiting.png";
import success from "@assets/icon/success.png";
import cancel from "@assets/icon/cancel.png";
import contractIcon from "@assets/icon/contract-grey.png";
import { ITxn } from "@keplr-wallet/stores";

const TransactionItem: FunctionComponent<{
  transactionInfo: ITxn;
}> = ({ transactionInfo }) => {
  const { chainStore } = useStore();
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "success":
        return success;
      case "pending":
        return pendingIcon;
      default:
        return cancel;
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case "Send":
        return sendIcon;
      case "ContractInteraction":
        return contractIcon;
      default:
        return contractIcon;
    }
  };

  const displayActivity = (status: string, amount: string) => {
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
          <img src={getStatusIcon(status)} alt={status} />
        </div>
      </div>
    );
  };

  return chainStore.current.explorerUrl ? (
    <a
      href={chainStore.current.explorerUrl + "/tx/" + transactionInfo.hash}
      target="_blank"
      rel="noreferrer"
    >
      {displayActivity(transactionInfo.status, transactionInfo.amount)}
    </a>
  ) : (
    displayActivity(transactionInfo.status, transactionInfo.amount)
  );
};

export const NativeEthTab = () => {
  const { chainStore, accountStore } = useStore();
  const [hashList, setHashList] = useState<ITxn[]>([]);

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
      {hashList.length > 0 ? (
        <div>
          {hashList.map((transactionInfo, index) => (
            <TransactionItem key={index} transactionInfo={transactionInfo} />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}> No activity </p>
      )}
    </React.Fragment>
  );
};
