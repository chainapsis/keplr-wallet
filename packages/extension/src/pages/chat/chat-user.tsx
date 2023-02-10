import { fromBech32 } from "@cosmjs/encoding";
import jazzicon from "@metamask/jazzicon";
import React, { useEffect, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { useHistory } from "react-router";
import rightArrowIcon from "@assets/icon/right-arrow.png";
import { decryptGroupTimestamp } from "@utils/decrypt-group";
import { decryptMessage } from "@utils/decrypt-message";
import style from "./style.module.scss";
import amplitude from "amplitude-js";
import { Group, GroupAddress } from "@chatTypes";

export const ChatUser: React.FC<{
  chainId: string;
  group: Group;
  contactName: string;
  targetAddress: string;
}> = ({ chainId, group, contactName, targetAddress }) => {
  const [message, setMessage] = useState("");
  const [groupData, setGroupData] = useState(group);

  const history = useHistory();

  const handleClick = () => {
    amplitude.getInstance().logEvent("Open DM click", {
      from: "Chat history",
    });
    history.push(`/chat/${targetAddress}`);
  };

  /// Current wallet user
  const sender = groupData?.addresses.find(
    (val) => val?.address !== targetAddress
  );
  /// Target user
  const receiver = groupData?.addresses.find(
    (val) => val?.address === targetAddress
  );

  const decryptGrpAddresses = async (
    groupAddress: GroupAddress,
    isSender: boolean
  ) => {
    if (groupAddress && groupAddress.groupLastSeenTimestamp) {
      const data = await decryptGroupTimestamp(
        chainId,
        groupAddress.groupLastSeenTimestamp,
        isSender
      );

      Object.assign(groupAddress, {
        groupLastSeenTimestamp: new Date(data).getTime(),
      });
    }
    if (groupAddress && groupAddress.lastSeenTimestamp) {
      const data = await decryptGroupTimestamp(
        chainId,
        groupAddress.lastSeenTimestamp,
        isSender
      );
      Object.assign(groupAddress, {
        lastSeenTimestamp: new Date(data).getTime(),
      });
    }

    return groupAddress;
  };

  const decryptGrp = async (group: Group) => {
    const tempGroup = { ...group };
    let tempSenderAddress: GroupAddress | undefined;
    let tempReceiverAddress: GroupAddress | undefined;

    /// Shallow copy
    /// Decrypting sender data
    const senderAddress = {
      ...group.addresses.find((val) => val.address !== targetAddress),
    };
    if (senderAddress)
      tempSenderAddress = await decryptGrpAddresses(
        senderAddress as GroupAddress,
        group.lastMessageSender === targetAddress
      );

    /// Decrypting receiver data
    const receiverAddress = {
      ...group.addresses.find((val) => val.address === targetAddress),
    };
    if (receiverAddress)
      tempReceiverAddress = await decryptGrpAddresses(
        receiverAddress as GroupAddress,
        group.lastMessageSender !== targetAddress
      );

    /// Storing decryptin address into the group object and updating the UI
    if (tempSenderAddress && tempReceiverAddress) {
      const tempGroupAddress = [tempSenderAddress, tempReceiverAddress];
      tempGroup.addresses = tempGroupAddress;
      setGroupData(tempGroup);
    }
  };

  const decryptMsg = async (
    chainId: string,
    contents: string,
    isSender: boolean
  ) => {
    const message = await decryptMessage(chainId, contents, isSender);
    setMessage(message.content.text);
  };

  useEffect(() => {
    if (group) {
      decryptMsg(
        chainId,
        group.lastMessageContents,
        group.lastMessageSender !== targetAddress
      );
      decryptGrp(group);
    }
  }, [chainId, targetAddress, group]);

  return (
    <div
      className={style.group}
      style={{ position: "relative" }}
      onClick={handleClick}
    >
      {Number(sender?.lastSeenTimestamp) <
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
              bottom: "22px",
              left: "8px",
              position: "absolute",
              zIndex: 1,
            }}
          />
        )}
      <div className={style.initials}>
        {ReactHtmlParser(
          jazzicon(28, parseInt(fromBech32(targetAddress).data.toString(), 16))
            .outerHTML
        )}
      </div>
      <div className={style.messageInner}>
        <div className={style.name}>{contactName}</div>
        <div className={style.messageText}>{message}</div>
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
