import closeIcon from "@assets/icon/close-grey.png";
import React, { useEffect, useState } from "react";
import { useStore } from "../../../stores";
import style from "./style.module.scss";

export const AgentDisclaimer = () => {
  const { chainStore, accountStore } = useStore();
  const walletAddress = accountStore.getAccount(chainStore.current.chainId)
    .bech32Address;
  const [openDialog, setIsOpendialog] = useState(false);

  useEffect(() => {
    const addresses = localStorage.getItem("fetchAgentDisclaimerSeen") || "";
    if (walletAddress) setIsOpendialog(!addresses.includes(walletAddress));
  }, [walletAddress]);

  const handleClose = () => {
    const addresses = localStorage.getItem("fetchAgentDisclaimerSeen") || "";
    localStorage.setItem(
      "fetchAgentDisclaimerSeen",
      addresses + `[${walletAddress}]`
    );
    setIsOpendialog(false);
  };

  return openDialog ? (
    <React.Fragment>
      <div className={style.overlay} onClick={() => handleClose()} />
      <div className={style.popupContainer}>
        <img
          draggable={false}
          src={closeIcon}
          style={{
            width: "12px",
            height: "12px",
            cursor: "pointer",
            position: "absolute",
            float: "right",
            right: "14px",
            top: "14px",
          }}
          onClick={() => handleClose()}
        />
        <div className={style.infoContainer}>
          <h3>Fetchbot disclaimer</h3>
          <p>
            Fetchbot is powered by an AI language model. As such it has similar
            limitations to existing language models. It might respond with
            incorrect or confusing information and as such users of Fetchbot
            should be aware of it.
          </p>
          <p>
            In order to improve Fetchbot, we will retain your interaction data
            with Fetchbot for a limited time for training purposes. By
            interacting with Fetchbot you will be helping us provide a more
            improved service for the whole community - thanks in advance.
          </p>
          <p>
            All other chat interactions are still end to end encrypted and are
            kept totally private between you and your recipient.
          </p>
        </div>
        <button type="button" onClick={() => handleClose()}>
          Continue
        </button>
      </div>
    </React.Fragment>
  ) : (
    <React.Fragment />
  );
};
