import {
  userChatGroupPagination,
  userChatGroups,
} from "@chatStore/messages-slice";
import { userDetails } from "@chatStore/user-slice";
import { Groups, NameAddress, Pagination } from "@chatTypes";
import { ContactsOnlyMessage } from "@components/contacts-only-message";
import { recieveGroups } from "@graphQL/recieve-messages";
import { useOnScreen } from "@hooks/use-on-screen";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { formatAddress } from "@utils/format";
import React, { createRef, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useStore } from "../../../stores";
import { ChatGroupUser } from "./chat-group-user";
import { ChatUser } from "./chat-user";
import style from "../style.module.scss";

export const GroupsHistory: React.FC<{
  chainId: string;
  searchString: string;
  addresses: NameAddress;
  setLoadingChats: any;
}> = ({ chainId, addresses, setLoadingChats, searchString }) => {
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
    const searchValue = searchString.trim().toLowerCase();
    const group = groups[contact];
    const contactAddressBookName = addresses[contact]?.toLowerCase();
    if (searchValue.length === 0) return true;

    /// For Group search
    if (!group.isDm) return group.name.toLowerCase().includes(searchValue);

    /// For DM
    if (userState?.messagingPubKey.privacySetting === PrivacySetting.Contacts) {
      return contactAddressBookName?.includes(searchValue);
    } else {
      /// PrivacySetting.Everybody
      return (
        contactAddressBookName?.includes(searchValue) ||
        contact.toLowerCase().includes(searchValue)
      );
    }
  };

  if (!Object.keys(groups).length)
    return (
      <div className={style["groupsArea"]}>
        <div className={style["resultText"]}>
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
      <div className={style["groupsArea"]}>
        <ContactsOnlyMessage />
      </div>
    );

  if (!Object.keys(groups).filter((contact) => filterGroups(contact)).length)
    return (
      <div className={style["groupsArea"]}>
        <div className={style["resultText"]}>
          No results found. Please refine your search.
        </div>
      </div>
    );

  return (
    <div className={style["groupsArea"]}>
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

          if (groups[contact].isDm)
            return (
              <div key={groups[contact].id}>
                <ChatUser
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

          const groupAddresses = groups[contact].addresses;
          const userGroupAddress = groupAddresses.find(
            (address) => address.address == accountInfo.bech32Address
          );
          const encryptedSymmetricKey =
            userGroupAddress?.encryptedSymmetricKey || "";
          return (
            <div key={groups[contact].id}>
              <ChatGroupUser
                chainId={chainId}
                encryptedSymmetricKey={encryptedSymmetricKey}
                group={groups[contact]}
                addresses={addresses}
              />
              {index === Object.keys(groups).length - 10 && (
                <div ref={messagesEncRef} />
              )}
            </div>
          );
        })}
      {groupsPagination?.lastPage > groupsPagination?.page && (
        <div className={style["loader"]} ref={messagesEndRef}>
          Fetching older Chats <i className="fas fa-spinner fa-spin ml-2" />
        </div>
      )}
    </div>
  );
};
