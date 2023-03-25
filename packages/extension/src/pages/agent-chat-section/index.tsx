/* eslint-disable react-hooks/exhaustive-deps */
import { userDetails } from "@chatStore/user-slice";
import { ChatErrorPopup } from "@components/chat-error-popup";
import { ChatLoader } from "@components/chat-loader";
import { SwitchUser } from "@components/switch-user";
import { HeaderLayout } from "@layouts/index";
import { fetchPublicKey } from "@utils/fetch-public-key";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useStore } from "../../stores";
import { Menu } from "../main/menu";
import { ChatsViewSection } from "./chats-view-section";
import { UserNameSection } from "./username-section";

export const AgentChatSection: FunctionComponent = () => {
  const history = useHistory();
  const targetAddress = history.location.pathname.split("/")[3];
  const user = useSelector(userDetails);

  const [targetPubKey, setTargetPubKey] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const { chainStore } = useStore();
  const current = chainStore.current;

  useEffect(() => {
    const setPublicAddress = async () => {
      const pubAddr = await fetchPublicKey(
        user.accessToken,
        current.chainId,
        targetAddress
      );
      setTargetPubKey(pubAddr?.publicKey || "");
    };
    setPublicAddress();
  }, [user.accessToken, current.chainId, targetAddress]);

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <UserNameSection />
      <ChatErrorPopup />
      {loadingChats ? (
        <ChatLoader message="Arranging messages, please wait..." />
      ) : (
        <ChatsViewSection
          targetPubKey={targetPubKey}
          setLoadingChats={setLoadingChats}
        />
      )}
    </HeaderLayout>
  );
};
