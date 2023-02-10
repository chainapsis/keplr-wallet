import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import rightArrowIcon from "@assets/icon/right-arrow.png";
import style from "./style.module.scss";
import amplitude from "amplitude-js";
import { Group, GroupMessagePayload, NameAddress } from "@chatTypes";
import { decryptGroupMessage } from "@utils/decrypt-group";
import { GroupMessageType } from "@utils/encrypt-group";
import { getUserName, getEventMessage } from "@utils/index";
import { useStore } from "../../stores";

export const ChatGroupUser: React.FC<{
  chainId: string;
  group: Group;
  encryptedSymmetricKey: string;
  addresses: NameAddress;
}> = ({ chainId, group, encryptedSymmetricKey, addresses }) => {
  const [
    decryptedMessage,
    setDecryptedMessage,
  ] = useState<GroupMessagePayload>();
  const history = useHistory();

  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const handleClick = () => {
    amplitude.getInstance().logEvent("Open Group click", {
      from: "Chat history",
    });
    history.push(`/chat/group-chat-section/${group.id}`);
  };

  useEffect(() => {
    async function loadDecryptedMessage() {
      const decryptedMsg = await decryptGroupMessage(
        group.lastMessageContents,
        chainId,
        encryptedSymmetricKey
      );
      setDecryptedMessage(decryptedMsg);
    }
    if (group) {
      loadDecryptedMessage();
    }
  }, [chainId, encryptedSymmetricKey, group]);

  function getLastMessage(): string {
    /// Show last message if user removed/leave from group
    if (group.removedAt) {
      return "You left or have been removed";
    }

    /// Show event type last message
    if (
      decryptedMessage &&
      (decryptedMessage.type == GroupMessageType.event.toString() ||
        decryptedMessage.type === GroupMessageType[GroupMessageType.event])
    ) {
      return getEventMessage(
        accountInfo.bech32Address,
        addresses,
        decryptedMessage.message
      );
    }

    /// Show last message
    return `${getUserName(
      accountInfo.bech32Address,
      addresses,
      group.lastMessageSender
    )}: ${decryptedMessage?.message}`;
  }

  return (
    <div
      className={style.group}
      style={{ position: "relative" }}
      onClick={handleClick}
    >
      {/* {Number(sender?.lastSeenTimestamp) <
        Number(receiver?.lastSeenTimestamp) &&
        group.lastMessageSender === targetAddress &&
        Number(group.lastMessageTimestamp) >
          Number(sender?.lastSeenTimestamp) && (
          <span
            style={{
              height: "12px",
              width: "12px",
              backgroundColor: "#d027e5",
              borderRadius: "20px",
              bottom: "20px",
              left: "6px",
              position: "absolute",
              zIndex: 1,
            }}
          />
        )} */}
      <div className={style.initials}>
        <img
          className={style.groupImage}
          src={require("@assets/group710.svg")}
        />
      </div>
      <div className={style.messageInner}>
        <div className={style.name}>{group.name}</div>
        <div className={style.messageText}>{getLastMessage()}</div>
      </div>
      <div>
        <img
          draggable={false}
          src={rightArrowIcon}
          style={{ width: "80%" }}
          alt="message"
        />
      </div>
    </div>
  );
};
