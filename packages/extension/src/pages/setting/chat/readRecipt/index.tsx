import { RegisterPublicKey } from "@keplr-wallet/background/build/messaging";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useIntl } from "react-intl";
import { store } from "@chatStore/index";
import { useHistory } from "react-router";
import { setMessagingPubKey, userDetails } from "@chatStore/user-slice";
import { useLoadingIndicator } from "@components/loading-indicator";
import { HeaderLayout } from "@layouts/index";
import { PageButton } from "../../page-button";
import { useStore } from "../../../../stores";
import style from "./style.module.scss";
import amplitude from "amplitude-js";
import { GRAPHQL_URL } from "../../../../config.ui.var";

export const ReadRecipt: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const loadingIndicator = useLoadingIndicator();
  const { chainStore, accountStore } = useStore();

  const walletAddress = accountStore.getAccount(chainStore.current.chainId)
    .bech32Address;

  const userState = useSelector(userDetails);
  const requester = new InExtensionMessageRequester();
  const [selectedPrivacySetting] = useState<PrivacySetting>(
    userState?.messagingPubKey.privacySetting
      ? userState?.messagingPubKey.privacySetting
      : PrivacySetting.Everybody
  );
  const [chatReceiptSetting, setChatReceiptSetting] = useState(
    userState?.messagingPubKey.chatReadReceiptSetting == null
      ? true
      : userState?.messagingPubKey.chatReadReceiptSetting
  );

  const updatePrivacy = async (setting: boolean) => {
    loadingIndicator.setIsLoading("privacy", true);
    try {
      const messagingPubKey = await requester.sendMessage(
        BACKGROUND_PORT,
        new RegisterPublicKey(
          GRAPHQL_URL.MESSAGING_SERVER,
          chainStore.current.chainId,
          userState.accessToken,
          walletAddress,
          selectedPrivacySetting,
          setting
        )
      );
      store.dispatch(setMessagingPubKey(messagingPubKey));
      setChatReceiptSetting(setting);
    } catch (e) {
      // Show error toaster
      console.error("error", e);
    } finally {
      loadingIndicator.setIsLoading("privacy", false);
    }
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.receipts",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.privacy.chat.receipts.on",
          })}
          paragraph={intl.formatMessage({
            id: "setting.privacy.chat.receipts.on.paragraph",
          })}
          onClick={(e) => {
            e.preventDefault();
            updatePrivacy(true);
            amplitude
              .getInstance()
              .logEvent("Read Receipts Privacy setting click", {
                readRecipt: true,
              });
          }}
          icons={useMemo(
            () =>
              chatReceiptSetting
                ? [
                    <img
                      key={0}
                      src={require("@assets/svg/tick-icon.svg")}
                      style={{ width: "100%" }}
                      alt="message"
                    />,
                  ]
                : [],
            [chatReceiptSetting]
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.privacy.chat.receipts.off",
          })}
          paragraph={intl.formatMessage({
            id: "setting.privacy.chat.receipts.off.paragraph",
          })}
          onClick={(e) => {
            e.preventDefault();
            updatePrivacy(false);
            amplitude
              .getInstance()
              .logEvent("Read Receipts Privacy setting click", {
                readRecipt: false,
              });
          }}
          icons={useMemo(
            () =>
              !chatReceiptSetting
                ? [
                    <img
                      key={0}
                      src={require("@assets/svg/tick-icon.svg")}
                      style={{ width: "100%" }}
                      alt="message"
                    />,
                  ]
                : [],
            [chatReceiptSetting]
          )}
        />
      </div>
    </HeaderLayout>
  );
});
