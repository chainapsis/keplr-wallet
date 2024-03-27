import { RegisterPublicKey } from "@keplr-wallet/background/build/messaging";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useLoadingIndicator } from "@components/loading-indicator";
import { HeaderLayout } from "@layouts/index";
import { PageButton } from "../../page-button";
import { useStore } from "../../../../stores";
import style from "./style.module.scss";
import { GRAPHQL_URL } from "../../../../config.ui.var";

export const ReadRecipt: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const loadingIndicator = useLoadingIndicator();
  const { chainStore, accountStore, analyticsStore, chatStore } = useStore();

  const walletAddress = accountStore.getAccount(
    chainStore.current.chainId
  ).bech32Address;

  const userState = chatStore.userDetailsStore;
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
      userState.setMessagingPubKey(messagingPubKey);
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
        analyticsStore.logEvent("back_click", { pageName: "Read Receipts" });
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
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
            analyticsStore.logEvent("read_receipts_click", {
              action: "On",
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
            analyticsStore.logEvent("read_receipts_click", {
              action: "Off",
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
