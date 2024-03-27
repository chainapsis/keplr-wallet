import React, { createRef, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { recieveGroups } from "@graphQL/recieve-messages";
import { useOnScreen } from "@hooks/use-on-screen";
import { useStore } from "../../stores";
import { formatAddress } from "@utils/format";
import style from "./style.module.scss";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { Groups, NameAddress, Pagination } from "@chatTypes";
import { ChatUser } from "./chat-user";
import { ChatGroupUser } from "./chat-group-user";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react-lite";

interface ChatsGroupHistoryProps {
  chainId: string;
  searchString: string;
  addresses: NameAddress;
  setLoadingChats: any;
}
export const ChatsGroupHistory: React.FC<ChatsGroupHistoryProps> = observer(
  ({ chainId, addresses, setLoadingChats, searchString }) => {
    const navigate = useNavigate();
    const { chainStore, accountStore, chatStore } = useStore();

    const groups: Groups = chatStore.messagesStore.userChatGroups;
    const groupsPagination: Pagination =
      chatStore.messagesStore.userChatGroupPagination;
    const [loadingGroups, setLoadingGroups] = useState(false);
    const current = chainStore.current;
    const accountInfo = accountStore.getAccount(current.chainId);
    const userState = chatStore.userDetailsStore;
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
        await recieveGroups(
          page,
          accountInfo.bech32Address,
          userState.accessToken,
          chatStore.messagesStore
        );
        setLoadingGroups(false);
        setLoadingChats(false);
      }
    };

    const filterGroups = (contact: string) => {
      const searchValue = searchString.trim();
      const group = groups[contact];

      /// For Group search
      if (!group.isDm) {
        if (searchValue.length > 0) {
          return group.name.toLowerCase().includes(searchValue.toLowerCase());
        }

        return true;
      }

      /// For DM
      const contactAddressBookName = addresses[contact];

      if (
        userState?.messagingPubKey.privacySetting === PrivacySetting.Contacts
      ) {
        if (searchString.length > 0) {
          if (
            !contactAddressBookName
              ?.toLowerCase()
              .includes(searchValue.toLowerCase())
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
              .includes(searchValue.toLowerCase()) &&
            !contact.toLowerCase().includes(searchValue.toLowerCase())
          )
            return false;
        }
        return true;
      }
    };

    if (!Object.keys(groups).length)
      return (
        <div className={style["groupsArea"]}>
          <div className={style["resultText"]}>
            No results. Don&apos;t worry you can create a new chat by clicking
            on the icon beside the search box.
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
          <div className={style["resultText"]}>
            If you are searching for an address not in your address book, you
            can&apos;t see them due to your selected privacy settings being
            &quot;contact only&quot;. Please add the address to your address
            book to be able to chat with them or change your privacy settings.
            <br />
            <a
              href="#"
              draggable={false}
              style={{
                textDecoration: "underline",
              }}
              onClick={(e) => {
                e.preventDefault();
                navigate("/setting/chat/privacy");
              }}
            >
              Go to chat privacy settings
            </a>
          </div>
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
        <div className={style["messageDisappear"]}>
          <img
            src={require("@assets/svg/ic-clock.svg")}
            draggable={false}
            alt="clock"
          />
          <FormattedMessage id="chat.disappear-message" />
        </div>
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
  }
);
