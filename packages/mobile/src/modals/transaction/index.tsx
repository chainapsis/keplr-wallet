import { CardModal } from "modals/card";
import React, { FunctionComponent, useEffect, useState } from "react";
import { NodeRequire, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { IconWithText } from "components/new/icon-with-text/icon-with-text";
import { Button } from "components/button";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer";
import { useStore } from "stores/index";
import LottieView from "lottie-react-native";

enum TransactionStatus {
  Pending,
  Success,
  Failed,
}

interface TransactionProcess {
  status: TransactionStatus;
  title: string;
  subTitle: string;
  img: NodeRequire;
}
export const TransactionModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  onTryAgainClick: () => void;
  onHomeClick: () => void;
  txnHash: string;
  chainId: string;
}> = ({ txnHash, chainId, isOpen, close, onHomeClick, onTryAgainClick }) => {
  const { chainStore } = useStore();

  const [transactionState, setTransactionState] = useState<TransactionProcess>({
    status: TransactionStatus.Pending,
    title: "Transaction pending",
    subTitle:
      "Transaction has been broadcasted to blockchain and pending confirmation",
    img: require("assets/lottie/txn-pending-icon.json"),
  });

  const style = useStyle();

  useEffect(() => {
    const chainInfo = chainStore.getChain(chainId);
    let txTracer: TendermintTxTracer | undefined;

    txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
    txTracer
      .traceTx(Buffer.from(txnHash, "hex"))
      .then((tx) => {
        if (tx.code == null || tx.code === 0) {
          setTransactionState({
            status: TransactionStatus.Success,
            title: "Transaction successful",
            subTitle:
              "Congratulations!\nYour transaction has been completed and confirmed by the blockchain",
            img: require("assets/lottie/txn-success-icon.json"),
          });
        } else {
          setTransactionState({
            status: TransactionStatus.Failed,
            title: "Transaction failed",
            subTitle: "Unfortunately your transaction has failed.",
            img: require("assets/lottie/txn-error-icon.json"),
          });
        }
      })
      .catch((e) => {
        console.log(`Failed to trace the tx (${txnHash})`, e);
      });

    return () => {
      if (txTracer) {
        txTracer.close();
      }
    };
  }, [chainId, chainStore, txnHash]);

  if (!isOpen) {
    return null;
  }

  return (
    <React.Fragment>
      <CardModal
        isOpen={isOpen}
        disableGesture={true}
        cardStyle={style.flatten(["padding-bottom-32"]) as ViewStyle}
      >
        <IconWithText
          icon={
            <LottieView
              source={transactionState.img}
              autoPlay
              loop
              style={
                style.flatten(["width-90", "margin-bottom-16"]) as ViewStyle
              }
            />
          }
          title={transactionState.title}
          subtitle={transactionState.subTitle}
        >
          {transactionState.status === TransactionStatus.Failed ? (
            <Button
              text="Try again"
              size="large"
              containerStyle={
                style.flatten([
                  "border-radius-64",
                  "margin-top-16",
                ]) as ViewStyle
              }
              rippleColor="black@50%"
              onPress={() => {
                close();
                onTryAgainClick();
              }}
            />
          ) : null}
          <Button
            text="Go to homescreen"
            size="large"
            containerStyle={
              style.flatten(
                ["border-radius-64"],
                [
                  transactionState.status === TransactionStatus.Failed
                    ? "margin-top-8"
                    : "margin-top-16",
                ]
              ) as ViewStyle
            }
            rippleColor="black@50%"
            onPress={() => {
              close();
              onHomeClick();
            }}
          />
        </IconWithText>
      </CardModal>
    </React.Fragment>
  );
};
