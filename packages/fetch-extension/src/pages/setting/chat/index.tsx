import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { HeaderLayout } from "@layouts/index";
// import { useLanguage } from "../../../languages";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { store } from "@chatStore/index";
import { userBlockedAddresses } from "@chatStore/messages-slice";
import {
  setAccessToken,
  setMessagingPubKey,
  userDetails,
} from "@chatStore/user-slice";
import { AUTH_SERVER } from "../../../config.ui.var";
import { fetchBlockList } from "@graphQL/messages-api";
import { useStore } from "../../../stores";
import { getJWT } from "@utils/auth";
import { fetchPublicKey } from "@utils/fetch-public-key";
import { PageButton } from "../page-button";
import style from "./style.module.scss";

export const ChatSettings: FunctionComponent = observer(() => {
  // const language = useLanguage();
  const navigate = useNavigate();
  const intl = useIntl();
  const userState = useSelector(userDetails);
  const blockedUsers = useSelector(userBlockedAddresses);
  const { chainStore, accountStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const walletAddress = accountStore.getAccount(
    chainStore.current.chainId
  ).bech32Address;
  const [loadingChatSettings, setLoadingChatSettings] = useState(false);
  const [chatPubKeyExists, setChatPubKeyExists] = useState(true);
  const [privacyParagraph, setPrivacyParagraph] = useState<
    string | undefined
  >();
  const [chatReadReceiptParagraph, setchatReadReceiptParagraph] = useState<
    string | undefined
  >();
  const [privacySetting, setPrivacySetting] = useState(
    PrivacySetting.Everybody
  );

  useEffect(() => {
    const setJWTAndFetchMsgPubKey = async () => {
      setLoadingChatSettings(true);
      const res = await getJWT(current.chainId, AUTH_SERVER);
      store.dispatch(setAccessToken(res));

      const pubKey = await fetchPublicKey(res, current.chainId, walletAddress);
      store.dispatch(setMessagingPubKey(pubKey));
      setPrivacySetting(pubKey?.privacySetting || PrivacySetting.Everybody);

      if (pubKey?.privacySetting) {
        setPrivacyParagraph(
          pubKey.privacySetting === PrivacySetting.Nobody
            ? "setting.privacy.paragraph.nobody"
            : pubKey.privacySetting === PrivacySetting.Contacts
            ? "setting.privacy.paragraph.contact"
            : "setting.privacy.paragraph.everybody"
        );
      } else {
        setPrivacyParagraph("setting.privacy.paragraph.everybody");
      }

      if (pubKey?.chatReadReceiptSetting != null) {
        setchatReadReceiptParagraph(
          pubKey.chatReadReceiptSetting
            ? "setting.receipts.paragraph.on"
            : "setting.receipts.paragraph"
        );
      } else {
        setchatReadReceiptParagraph("setting.receipts.paragraph.on");
      }

      if (
        !pubKey?.publicKey ||
        pubKey.privacySetting === PrivacySetting.Nobody
      ) {
        setChatPubKeyExists(false);
        return setLoadingChatSettings(false);
      }
      fetchBlockList();
      setLoadingChatSettings(false);
    };
    if (!userState.messagingPubKey.length && !loadingChatSettings)
      setJWTAndFetchMsgPubKey();
  }, [current.chainId, walletAddress]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.chat",
      })}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", {
          pageName: "Chat Setting",
        });
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.block",
          })}
          paragraph={
            chatPubKeyExists
              ? `${
                  Object.keys(blockedUsers).filter((user) => blockedUsers[user])
                    .length
                } Addresses Blocked`
              : privacySetting == PrivacySetting.Nobody
              ? "Please change your chat privacy settings"
              : "Please Activate Chat Functionality to Proceed"
          }
          onClick={() => {
            if (chatPubKeyExists) {
              analyticsStore.logEvent("block_list_click", {
                pageName: "Chat Setting",
              });
              navigate("/setting/chat/block");
            }
          }}
          icons={useMemo(
            () =>
              chatPubKeyExists
                ? [<i key="next" className="fas fa-chevron-right" />]
                : [],
            [chatPubKeyExists]
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.privacy",
          })}
          paragraph={
            privacyParagraph &&
            intl.formatMessage({
              id: privacyParagraph,
            })
          }
          onClick={() => {
            navigate("/setting/chat/privacy");
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.receipts",
          })}
          paragraph={
            chatReadReceiptParagraph &&
            intl.formatMessage({
              id: chatReadReceiptParagraph,
            })
          }
          onClick={() => {
            navigate("/setting/chat/readRecipt");
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
      </div>
    </HeaderLayout>
  );
});
