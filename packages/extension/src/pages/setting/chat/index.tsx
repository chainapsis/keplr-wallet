import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { HeaderLayout } from "../../../layouts";
// import { useLanguage } from "../../../languages";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { store } from "../../../chatStore";
import { userBlockedAddresses } from "../../../chatStore/messages-slice";
import {
  setAccessToken,
  setMessagingPubKey,
  userDetails,
} from "../../../chatStore/user-slice";
import { AUTH_SERVER } from "../../../config.ui.var";
import { fetchBlockList } from "../../../graphQL/messages-api";
import { useStore } from "../../../stores";
import { getJWT } from "../../../utils/auth";
import { fetchPublicKey } from "../../../utils/fetch-public-key";
import { PageButton } from "../page-button";
import style from "./style.module.scss";

export const ChatSettings: FunctionComponent = observer(() => {
  // const language = useLanguage();
  const history = useHistory();
  const intl = useIntl();
  const userState = useSelector(userDetails);
  const blockedUsers = useSelector(userBlockedAddresses);
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const walletAddress = accountStore.getAccount(chainStore.current.chainId)
    .bech32Address;
  const [loadingChatSettings, setLoadingChatSettings] = useState(false);
  const [chatPubKeyExists, setChatPubKeyExists] = useState(true);
  const [privacyParagraph, setPrivacyParagraph] = useState(
    "setting.privacy.paragraph.everybody"
  );

  useEffect(() => {
    const setJWTAndFetchMsgPubKey = async () => {
      setLoadingChatSettings(true);
      const res = await getJWT(current.chainId, AUTH_SERVER);
      store.dispatch(setAccessToken(res));

      const pubKey = await fetchPublicKey(res, current.chainId, walletAddress);
      store.dispatch(setMessagingPubKey(pubKey));

      if (pubKey?.privacySetting)
        setPrivacyParagraph(
          pubKey.privacySetting === PrivacySetting.Nobody
            ? "setting.privacy.paragraph.nobody"
            : pubKey.privacySetting === PrivacySetting.Contacts
            ? "setting.privacy.paragraph.contact"
            : "setting.privacy.paragraph.everybody"
        );

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
    if (
      (!userState.accessToken.length || !userState.messagingPubKey.length) &&
      !loadingChatSettings
    )
      setJWTAndFetchMsgPubKey();
  }, [
    current.chainId,
    loadingChatSettings,
    userState.accessToken.length,
    userState.messagingPubKey.length,
    walletAddress,
  ]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.chat",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
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
              : "Please Activate Chat Functionality to Proceed"
          }
          onClick={() => {
            if (chatPubKeyExists)
              history.push({
                pathname: "/setting/chat/block",
              });
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
          paragraph={intl.formatMessage({
            id: privacyParagraph,
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/chat/privacy",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        {/* <PageButton
          title={intl.formatMessage({
            id: "setting.receipts",
          })}
          paragraph={intl.formatMessage({
            id: "setting.receipts.paragraph",
          })}
          // onClick={() => {
          //   history.push({
          //     pathname: "/setting/block",
          //   });
          // }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        /> */}
      </div>
    </HeaderLayout>
  );
});
