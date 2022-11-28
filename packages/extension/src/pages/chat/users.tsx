import { fromBech32 } from "@cosmjs/encoding";
import jazzicon from "@metamask/jazzicon";
import React, { createRef, useEffect, useRef, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import {
  Group,
  Groups,
  Pagination,
  userChatGroupPagination,
  userChatGroups,
} from "../../chatStore/messages-slice";
import { recieveGroups } from "../../graphQL/recieve-messages";
import { useOnScreen } from "../../hooks/use-on-screen";
import rightArrowIcon from "../../public/assets/icon/right-arrow.png";
import { useStore } from "../../stores";
import { decryptMessage } from "../../utils/decrypt-message";
import { formatAddress } from "../../utils/format";
import style from "./style.module.scss";

const User: React.FC<{
  chainId: string;
  group: Group;
  contactName: string;
  contactAddress: string;
}> = ({ chainId, group, contactName, contactAddress }) => {
  const [message, setMessage] = useState("");
  const history = useHistory();
  const handleClick = () => {
    history.push(`/chat/${contactAddress}`);
  };
  const decryptMsg = async (
    chainId: string,
    contents: string,
    isSender: boolean
  ) => {
    const message = await decryptMessage(chainId, contents, isSender);
    setMessage(message);
  };

  useEffect(() => {
    if (group)
      decryptMsg(
        chainId,
        group.lastMessageContents,
        group.lastMessageSender !== contactAddress
      );
  }, [chainId, contactAddress, group]);

  return (
    <div className={style.group} onClick={handleClick}>
      <div className={style.initials}>
        {ReactHtmlParser(
          jazzicon(24, parseInt(fromBech32(contactAddress).data.toString(), 16))
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
            parseFloat(groups[b].createdAt) - parseFloat(groups[a].createdAt)
        )
        .filter((contact) => filterGroups(contact))
        .map((contact, index) => {
          // translate the contact address into the address book name if it exists
          const contactAddressBookName = addresses[contact];
          return (
            <>
              <User
                key={index}
                group={groups[contact]}
                contactName={
                  contactAddressBookName
                    ? formatAddress(contactAddressBookName)
                    : formatAddress(contact)
                }
                contactAddress={contact}
                chainId={chainId}
              />
              {index === Object.keys(groups).length - 10 && (
                <div ref={messagesEncRef} />
              )}
            </>
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
