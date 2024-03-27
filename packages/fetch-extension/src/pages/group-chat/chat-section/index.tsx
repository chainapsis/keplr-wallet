/* eslint-disable react-hooks/exhaustive-deps */
import React, { FunctionComponent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useStore } from "../../../stores";
import { ChatErrorPopup } from "@components/chat-error-popup";
import { SwitchUser } from "@components/switch-user";
import { HeaderLayout } from "@layouts/index";
import { Menu } from "../../main/menu";
import { UserNameSection } from "./username-section";
import { GroupChatsViewSection } from "./chats-view-section";
import { ChatActionsPopup } from "@components/chat-actions-popup";

import { Chats, GroupChatOptions, GroupMembers, Groups } from "@chatTypes";
import { GroupChatActionsDropdown } from "@components/group-chat-actions-dropdown";
import { leaveGroup } from "@graphQL/groups-api";
import { deliverGroupMessages } from "@graphQL/messages-api";
import { GroupMessageType } from "@utils/encrypt-group";
import { recieveGroups } from "@graphQL/recieve-messages";
import { leaveGroupEvent } from "@utils/group-events";
import { observer } from "mobx-react-lite";

export const GroupChatSection: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const { chainStore, accountStore, analyticsStore, chatStore } = useStore();
  const groupId = useLocation().pathname.split("/")[3];
  const groups: Groups = chatStore.messagesStore.userChatGroups;
  const userChats: Chats = chatStore.messagesStore.userMessages;

  const group = groups[groupId];
  const user = chatStore.userDetailsStore;

  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountInfo.bech32Address;

  const isAdmin =
    group.addresses.find((element) => element.address === walletAddress)
      ?.isAdmin ?? false;

  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmAction, setConfirmAction] = useState(false);
  const [isMemberRemoved, setMemberRemoved] = useState(false);
  const [action, setAction] = useState("");

  /// Find the current user and check user exists in the group or not
  const currentUser = group.addresses.find(
    (element) => element.address === accountInfo.bech32Address
  );

  useEffect(() => {
    if (group?.removedAt || currentUser?.removedAt) {
      /// User is removed by admin
      setMemberRemoved(true);
    } else if (!currentUser && !isMemberRemoved) {
      /// User removed from group address array
      setMemberRemoved(true);
    } else if (currentUser && isMemberRemoved) {
      setMemberRemoved(false);
    }
  }, [groups]);

  const handleDropDown = () => {
    setShowDropdown(!showDropdown);
  };

  function navigateToPage(page: string) {
    const members: GroupMembers[] = group.addresses
      .filter((element) => !element.removedAt)
      .map((element) => {
        return {
          address: element.address,
          pubKey: element.pubKey,
          encryptedSymmetricKey: element.encryptedSymmetricKey,
          isAdmin: element.isAdmin,
        };
      });
    chatStore.newGroupStore.setNewGroupInfo({
      description: group.description! ? "" : group.description,
      groupId: group.id,
      members: members,
      name: group.name,
    });
    chatStore.newGroupStore.setIsGroupEdit(true);
    navigate(page);
  }

  const handleClick = (option: GroupChatOptions) => {
    setShowDropdown(false);
    switch (option) {
      case GroupChatOptions.groupInfo:
        analyticsStore.logEvent("group_info_click");
        navigateToPage("/chat/group-chat/review-details");
        break;

      case GroupChatOptions.chatSettings:
        analyticsStore.logEvent("group_chat_setting_click");
        navigateToPage("/chat/group-chat/create");
        break;

      case GroupChatOptions.deleteGroup:
        analyticsStore.logEvent("delete_group_click", { action: "Cancel" });
        setAction("deleteGroup");
        setConfirmAction(true);
        break;

      case GroupChatOptions.leaveGroup:
      default:
        analyticsStore.logEvent("leave_group_click", { action: "Cancel" });
        setAction(GroupChatOptions[option]);
        setConfirmAction(true);
        break;
    }
  };

  const handleAction = async () => {
    if (currentUser) {
      const { encryptedSymmetricKey } = currentUser;

      const message = await deliverGroupMessages(
        user.accessToken,
        current.chainId,
        leaveGroupEvent(accountInfo.bech32Address),
        encryptedSymmetricKey || "",
        GroupMessageType.event,
        accountInfo.bech32Address,
        groupId
      );
      chatStore.messagesStore.updateLatestSentMessage(message);
      if (message) {
        await leaveGroup(groupId, user.accessToken);
        recieveGroups(
          0,
          accountInfo.bech32Address,
          user.accessToken,
          chatStore.messagesStore
        );

        const messagesObj: any = { [message.id]: message };
        const messages = { ...userChats[groupId].messages, ...messagesObj };
        const pagination = chatStore.messagesStore.groupsPagination;
        chatStore.messagesStore.updateChatList(groupId, messages, pagination);
      }
    }
    setConfirmAction(false);
  };

  return (
    <div
      onClick={() => {
        if (showDropdown) {
          handleDropDown();
        }
      }}
    >
      <HeaderLayout
        showChainName={true}
        canChangeChainInfo={true}
        menuRenderer={<Menu />}
        rightRenderer={<SwitchUser />}
      >
        <ChatErrorPopup />
        <div>
          <UserNameSection
            handleDropDown={handleDropDown}
            groupName={group.name}
          />

          <GroupChatActionsDropdown
            isMemberRemoved={isMemberRemoved}
            showDropdown={showDropdown}
            isAdmin={isAdmin}
            handleClick={handleClick}
          />

          <GroupChatsViewSection isMemberRemoved={isMemberRemoved} />

          {confirmAction && (
            <ChatActionsPopup
              action={action}
              setConfirmAction={setConfirmAction}
              handleAction={handleAction}
            />
          )}
        </div>
      </HeaderLayout>
    </div>
  );
});
