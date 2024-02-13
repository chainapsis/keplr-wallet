import { RegisterPublicKey } from "@keplr-wallet/background/build/messaging";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { store } from "@chatStore/index";
import {
  resetUser,
  setMessagingPubKey,
  userDetails,
} from "@chatStore/user-slice";
import privacyIcon from "@assets/hello.png";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { GRAPHQL_URL } from "../../config.ui.var";

export const ChatInitPopup = ({
  openDialog,
  setIsOpendialog,
  setLoadingChats,
}: {
  openDialog: boolean;
  setIsOpendialog: any;
  setLoadingChats: any;
}) => {
  const userState = useSelector(userDetails);

  const { chainStore, accountStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const walletAddress = accountStore.getAccount(
    chainStore.current.chainId
  ).bech32Address;

  const navigate = useNavigate();
  // address book values

  const [selectedPrivacySetting, setSelectedPrivacySetting] =
    useState<PrivacySetting>(
      userState?.messagingPubKey.privacySetting
        ? userState?.messagingPubKey.privacySetting
        : PrivacySetting.Everybody
    );

  const requester = new InExtensionMessageRequester();

  const registerAndSetMessagePubKey = async () => {
    setLoadingChats(true);
    try {
      const messagingPubKey = await requester.sendMessage(
        BACKGROUND_PORT,
        new RegisterPublicKey(
          GRAPHQL_URL.MESSAGING_SERVER,
          current.chainId,
          userState.accessToken,
          walletAddress,
          selectedPrivacySetting
        )
      );
      store.dispatch(setMessagingPubKey(messagingPubKey));
      navigate("/chat", { replace: true });
    } catch (e) {
      // Show error toaster
      console.error("error", e);
      store.dispatch(resetUser({}));
      // Redirect to home
      navigate("/", { replace: true });
    } finally {
      analyticsStore.logEvent("chat_privacy_click", {
        action: selectedPrivacySetting,
      });
      setIsOpendialog(false);
      setLoadingChats(false);
    }
  };

  return openDialog && userState.accessToken.length > 0 ? (
    <React.Fragment>
      <div className={style["overlay"]} />
      <div className={style["popupContainer"]}>
        <img draggable={false} src={privacyIcon} />
        <br />
        <div className={style["infoContainer"]}>
          <h3>We have just added Chat!</h3>
          <p>Now you can chat with other active wallets.</p>
          <p>Select who can send you messages</p>
          <form>
            <input
              type="radio"
              value={PrivacySetting.Everybody}
              checked={selectedPrivacySetting === PrivacySetting.Everybody}
              onChange={(e) =>
                setSelectedPrivacySetting(e.target.value as PrivacySetting)
              }
            />
            <label htmlFor="option1" className={style["optionsLabel"]}>
              Everybody
            </label>
            <br />
            <input
              type="radio"
              value={PrivacySetting.Contacts}
              checked={selectedPrivacySetting === PrivacySetting.Contacts}
              onChange={(e) =>
                setSelectedPrivacySetting(e.target.value as PrivacySetting)
              }
            />
            <label htmlFor="option2" className={style["optionsLabel"]}>
              Only contacts in address book
            </label>
            <br />
            <input
              type="radio"
              value={PrivacySetting.Nobody}
              checked={selectedPrivacySetting === PrivacySetting.Nobody}
              onChange={(e) =>
                setSelectedPrivacySetting(e.target.value as PrivacySetting)
              }
            />
            <label htmlFor="option3" className={style["optionsLabel"]}>
              Nobody
            </label>
            <br />
          </form>
          <p>
            These settings can be changed at any time from the settings menu.
          </p>
        </div>
        <button type="button" onClick={registerAndSetMessagePubKey}>
          Continue
        </button>
      </div>
    </React.Fragment>
  ) : (
    <React.Fragment />
  );
};
