import {
  userChatAgents,
  userChatGroupPagination,
} from "@chatStore/messages-slice";
import { Groups, NameAddress, Pagination } from "@chatTypes";
import { recieveGroups } from "@graphQL/recieve-messages";
import { useOnScreen } from "@hooks/use-on-screen";
import { formatAddress } from "@utils/format";
import React, { createRef, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useStore } from "../../../stores";
import { ChatAgent } from "./chat-agent";
import style from "../style.module.scss";
import { AgentInit } from "@components/agents/agent-init";
import { AGENT_ADDRESS } from "../../../config.ui.var";

export const AgentsHistory: React.FC<{
  chainId: string;
  searchString: string;
  addresses: NameAddress;
  setLoadingChats: any;
}> = ({ chainId, addresses, setLoadingChats, searchString }) => {
  const groups: Groups = useSelector(userChatAgents);
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
    let contactAddressBookName = addresses[contact]?.toLowerCase();
    if (!contactAddressBookName && contact === AGENT_ADDRESS[chainId])
      contactAddressBookName = "fetchbot";
    if (searchValue.length === 0) return true;

    /// PrivacySetting.Everybody
    return (
      contactAddressBookName?.includes(searchValue) ||
      contact.toLowerCase().includes(searchValue)
    );
  };

  if (!Object.keys(groups).length) return <AgentInit />;

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
          return (
            <div key={groups[contact].id}>
              <ChatAgent
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
        <div className={style["loader"]} ref={messagesEndRef}>
          Fetching older Chats <i className="fas fa-spinner fa-spin ml-2" />
        </div>
      )}
    </div>
  );
};
