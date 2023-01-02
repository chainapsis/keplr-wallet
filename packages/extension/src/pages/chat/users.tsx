import { fromBech32 } from "@cosmjs/encoding";
import jazzicon from "@metamask/jazzicon";
import React, { createRef, useEffect, useRef, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import {
  Group,
  GroupAddress,
  Groups,
  Pagination,
  userChatGroupPagination,
  userChatGroups,
} from "../../chatStore/messages-slice";
import { recieveGroups } from "../../graphQL/recieve-messages";
import { useOnScreen } from "../../hooks/use-on-screen";
import rightArrowIcon from "../../public/assets/icon/right-arrow.png";
import { useStore } from "../../stores";
import { decryptGroupTimestamp } from "../../utils/decrypt-group";
import { decryptMessage } from "../../utils/decrypt-message";
import { formatAddress } from "../../utils/format";
import style from "./style.module.scss";
import amplitude from "amplitude-js";
import { userDetails } from "../../chatStore/user-slice";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";

const User: React.FC<{
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
              bottom: "20px",
              left: "6px",
              position: "absolute",
              zIndex: 1,
            }}
          />
        )}
      <div className={style.initials}>
        {ReactHtmlParser(
          jazzicon(24, parseInt(fromBech32(targetAddress).data.toString(), 16))
            .outerHTML
        )}
      </div>
      <div className={style.messageInner}>
        <div className={style.name}>{contactName}</div>
        <div className={style.messageText}>{message}</div>
      </div>
      <div>
        <img src={rightArrowIcon} style={{ width: "80%" }} alt="message" />
      </div>
    </div>
  );
};

export interface NameAddress {
  [key: string]: string;
}

export const ChatsGroupSection: React.FC<{
  chainId: string;
  searchString: string;
  addresses: NameAddress;
  setLoadingChats: any;
}> = ({ chainId, addresses, setLoadingChats, searchString }) => {
  const history = useHistory();
  const userState = useSelector(userDetails);
  const groups: Groups = useSelector(userChatGroups);
  const groupsPagination: Pagination = useSelector(userChatGroupPagination);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  //Scrolling Logic
  const messagesEndRef: any = createRef();
  const messagesEncRef: any = useRef(null);
  const isOnScreen = useOnScreen(messagesEndRef);

  useEffect(() => {
    const getChats = async () => {
      await loadUserGroups();
      messagesEncRef.current.scrollIntoView(true);
    };
    if (isOnScreen) getChats();
  }, [isOnScreen]);

  const loadUserGroups = async () => {
    if (!loadingGroups) {
      const page = groupsPagination?.page + 1 || 0;
      setLoadingGroups(true);
      await recieveGroups(page, accountInfo.bech32Address);
      setLoadingGroups(false);
      setLoadingChats(false);
    }
  };

  const filterGroups = (contact: string) => {
    const contactAddressBookName = addresses[contact];

    if (userState?.messagingPubKey.privacySetting === PrivacySetting.Contacts) {
      if (searchString.length > 0) {
        if (
          !contactAddressBookName
            ?.toLowerCase()
            .includes(searchString.trim().toLowerCase())
        )
          return false;
      }

      return !!contactAddressBookName;
    } else {
      /// PrivacySetting.Everybody
      if (searchString.length > 0) {
        if (
          !contactAddressBookName
            ?.toLowerCase()
            .includes(searchString.trim().toLowerCase()) &&
          !contact.toLowerCase().includes(searchString.trim().toLowerCase())
        )
          return false;
      }
      return true;
    }
  };

  if (!Object.keys(groups).length)
    return (
      <div className={style.groupsArea}>
        <div className={style.resultText}>
          No results. Don&apos;t worry you can create a new chat by clicking on
          the icon beside the search box.
        </div>
      </div>
    );

  if (
    !Object.keys(groups).filter((contact) => filterGroups(contact)).length &&
    userState.messagingPubKey.privacySetting &&
    userState.messagingPubKey.privacySetting === PrivacySetting.Contacts
  )
    return (
      <div className={style.groupsArea}>
        <div className={style.resultText}>
          If you are searching for an address not in your address book, you
          can&apos;t see them due to your selected privacy settings being
          &quot;contact only&quot;. Please add the address to your address book
          to be able to chat with them or change your privacy settings.
          <br />
          <a
            href="#"
            style={{
              textDecoration: "underline",
            }}
            onClick={(e) => {
              e.preventDefault();
              history.push("/setting/chat/privacy");
            }}
          >
            Go to chat privacy settings
          </a>
        </div>
      </div>
    );

  if (!Object.keys(groups).filter((contact) => filterGroups(contact)).length)
    return (
      <div className={style.groupsArea}>
        <div className={style.resultText}>
          No results found. Please refine your search.
        </div>
      </div>
    );

  return (
    <div className={style.groupsArea}>
      {Object.keys(groups)
        .sort(
          (a, b) =>
            parseFloat(groups[b].lastMessageTimestamp) -
            parseFloat(groups[a].lastMessageTimestamp)
        )
        .filter((contact) => filterGroups(contact))
        .map((contact, index) => {
          // translate the contact address into the address book name if it exists
          const contactAddressBookName = addresses[contact];
          return (
            <div key={groups[contact].id}>
              <User
                group={groups[contact]}
                contactName={
                  contactAddressBookName
                    ? formatAddress(contactAddressBookName)
                    : formatAddress(contact)
                }
                targetAddress={contact}
                chainId={chainId}
              />
              {index === Object.keys(groups).length - 10 && (
                <div ref={messagesEncRef} />
              )}
            </div>
          );
        })}
      {groupsPagination?.lastPage > groupsPagination?.page && (
        <div className={style.loader} ref={messagesEndRef}>
          Fetching older Chats <i className="fas fa-spinner fa-spin ml-2" />
        </div>
      )}
    </div>
  );
};
