import searchIcon from "@assets/icon/search.png";
import { store } from "@chatStore/index";
import { setGroups, userChatGroups } from "@chatStore/messages-slice";
import { newGroupDetails, setNewGroupInfo } from "@chatStore/new-group-slice";
import { userDetails } from "@chatStore/user-slice";
import {
  Group,
  GroupDetails,
  GroupMembers,
  Groups,
  NameAddress,
  NewGroupDetails,
} from "@chatTypes";
import { ChatLoader } from "@components/chat-loader";
import { ChatMember } from "@components/chat-member";
import { fromBech32 } from "@cosmjs/encoding";
import { createGroup } from "@graphQL/groups-api";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import { HeaderLayout } from "@layouts/index";
import jazzicon from "@metamask/jazzicon";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Button } from "reactstrap";
import { EthereumEndpoint } from "../../../config.ui";
import { useStore } from "../../../stores";
import { encryptGroupMessage, GroupMessageType } from "@utils/encrypt-group";
import { fetchPublicKey } from "@utils/fetch-public-key";
import { formatAddress, formatGroupName } from "@utils/format";
import {
  decryptEncryptedSymmetricKey,
  encryptSymmetricKey,
} from "@utils/symmetric-key";
import style from "./style.module.scss";
import { recieveMessages } from "@graphQL/recieve-messages";
import { addMemberEvent } from "@utils/group-events";
import { ToolTip } from "@components/tooltip";
import { DeactivatedChat } from "@components/chat/deactivated-chat";
import { ContactsOnlyMessage } from "@components/contacts-only-message";
import amplitude from "amplitude-js";

export const AddMember: FunctionComponent = observer(() => {
  const history = useHistory();
  const user = useSelector(userDetails);
  /// Current Group State
  const newGroupState: NewGroupDetails = useSelector(newGroupDetails);
  /// Group Info
  const groups: Groups = useSelector(userChatGroups);
  const group: Group = groups[newGroupState.group.groupId];

  const [selectedMembers, setSelectedMembers] = useState<GroupMembers[]>(
    newGroupState.group.members || []
  );
  const [newAddedMembers, setNewAddedMembers] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState("");
  const [addresses, setAddresses] = useState<NameAddress[]>([]);
  const [randomAddress, setRandomAddress] = useState<NameAddress | undefined>();

  const { chainStore, accountStore, queriesStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountInfo.bech32Address;
  // address book values
  const queries = queriesStore.get(chainStore.current.chainId);
  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    chainStore.current.chainId,
    accountInfo.msgOpts.ibcTransfer,
    accountInfo.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  const [selectedChainId] = useState(
    ibcTransferConfigs.channelConfig?.channel
      ? ibcTransferConfigs.channelConfig.channel.counterpartyChainId
      : current.chainId
  );
  const addressBookConfig = useAddressBookConfig(
    new ExtensionKVStore("address-book"),
    chainStore,
    selectedChainId,
    {
      setRecipient: (): void => {
        // noop
      },
      setMemo: (): void => {
        // noop
      },
    }
  );

  const userAddresses: NameAddress[] = addressBookConfig.addressBookDatas
    .map((data) => {
      if (newGroupState.isEditGroup) {
        const isAlreadyMember = selectedMembers.find(
          (element) => element.address === data.address
        );

        return {
          name: data.name,
          address: data.address,
          alreadyMember: isAlreadyMember ? "true" : "",
        };
      } else
        return {
          name: data.name,
          address: data.address,
          alreadyMember: "",
        };
    })
    .sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

  useEffect(() => {
    setAddresses(userAddresses.filter((a) => a.address !== walletAddress));

    /// Adding login user into the list
    if (!newGroupState.isEditGroup) handleAddRemoveMember(walletAddress, true);
  }, [addressBookConfig.addressBookDatas]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    const searchedVal = e.target.value.toLowerCase();
    const addresses = userAddresses.filter(
      (address: NameAddress) =>
        address.address !== walletAddress &&
        (address.name.toLowerCase().includes(searchedVal) ||
          address.address.toLowerCase().includes(searchedVal))
    );

    if (
      addresses.length === 0 &&
      searchedVal &&
      searchedVal !== walletAddress &&
      user?.messagingPubKey.privacySetting === PrivacySetting.Everybody
    ) {
      try {
        //check if searchedVal is valid address
        Bech32Address.validate(
          searchedVal,
          chainStore.current.bech32Config.bech32PrefixAccAddr
        );

        let isAlreadyMember;
        /// validating the address in selected member in case of edit
        /// to avoid display the alread added member address
        if (newGroupState.isEditGroup) {
          isAlreadyMember = selectedMembers.find(
            (element) => element.address === searchedVal
          );
        }
        const address: NameAddress = {
          name: formatAddress(searchedVal),
          address: searchedVal,
          alreadyMember: isAlreadyMember ? "true" : "",
        };

        setRandomAddress(address);
        setAddresses([]);
      } catch (e) {
        setAddresses([]);
        setRandomAddress(undefined);
      }
    } else {
      setRandomAddress(undefined);
      setAddresses(addresses);
    }
  };

  const isMemberExist = (contactAddress: string) =>
    !!selectedMembers.find((element) => element.address === contactAddress);

  const handleAddRemoveMember = async (
    contactAddress: string,
    isAdmin?: boolean
  ) => {
    if (!isMemberExist(contactAddress)) {
      const pubAddr = await fetchPublicKey(
        user.accessToken,
        current.chainId,
        contactAddress
      );
      if (pubAddr && pubAddr.publicKey) {
        let encryptedSymmetricKey = "";
        if (group) {
          const userGroupAddress = group.addresses.find(
            (address) => address.address == walletAddress
          );
          //get symmetricKey of group using
          const symmetricKey = await decryptEncryptedSymmetricKey(
            current.chainId,
            userGroupAddress?.encryptedSymmetricKey || ""
          );
          encryptedSymmetricKey = await encryptSymmetricKey(
            current.chainId,
            user.accessToken,
            symmetricKey,
            contactAddress
          );
        }

        const tempMember: GroupMembers = {
          address: contactAddress,
          pubKey: pubAddr.publicKey,
          encryptedSymmetricKey,
          isAdmin: isAdmin || false,
        };
        const tempMembers = [...selectedMembers, tempMember];

        store.dispatch(setNewGroupInfo({ members: tempMembers }));
        setSelectedMembers(tempMembers);
        setNewAddedMembers([...newAddedMembers, contactAddress]);
      }
    } else {
      const tempMembers = selectedMembers.filter(
        (item) => item.address !== contactAddress
      );
      store.dispatch(setNewGroupInfo({ members: tempMembers }));
      setSelectedMembers(tempMembers);

      /// Removing new address
      const newMembers = newAddedMembers.filter(
        (item) => item !== contactAddress
      );
      setNewAddedMembers(newMembers);
    }
  };

  async function handleUpdateGroup() {
    if (newAddedMembers.length === 0) {
      history.goBack();
      return;
    }

    setIsLoading(true);
    const groupAddresses = newGroupState.group.members;
    const userGroupAddress = groupAddresses.find(
      (address) => address.address == accountInfo.bech32Address
    );
    const encryptedSymmetricKey = userGroupAddress?.encryptedSymmetricKey || "";
    const contents = await encryptGroupMessage(
      current.chainId,
      addMemberEvent(accountInfo.bech32Address, newAddedMembers.join()),
      GroupMessageType.event,
      encryptedSymmetricKey,
      accountInfo.bech32Address,
      newGroupState.group.groupId,
      user.accessToken
    );
    const updatedGroupInfo: GroupDetails = {
      description: newGroupState.group.description ?? "",
      groupId: newGroupState.group.groupId,
      contents: contents,
      members: selectedMembers,
      name: newGroupState.group.name,
      onlyAdminMessages: false,
    };
    const group = await createGroup(updatedGroupInfo);
    setIsLoading(false);

    if (group) {
      /// updating the group(chat history) object
      const groups: any = { [group.id]: group };
      store.dispatch(setGroups({ groups }));
      /// fetching the group messages again
      await recieveMessages(group.id, null, 0, group.isDm, group.id);
      amplitude.getInstance().logEvent("New members added", {
        from: "Group Info",
      });
      history.goBack();
    }
  }

  if (
    user.messagingPubKey.privacySetting &&
    user.messagingPubKey.privacySetting === PrivacySetting.Nobody
  ) {
    return <DeactivatedChat />;
  }

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"New Group Chat"}
      onBackButton={() => {
        history.goBack();
      }}
    >
      {!addressBookConfig.isLoaded ? (
        <ChatLoader message="Loading contacts, please wait..." />
      ) : (
        <div className={style.newMemberContainer}>
          <div className={style.searchContainer}>
            <div className={style.searchBox}>
              <img draggable={false} src={searchIcon} alt="search" />
              <input
                placeholder="Search by name or address"
                value={inputVal}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className={style.membersContainer}>
            {randomAddress && (
              <ChatMember
                address={randomAddress}
                key={randomAddress.address}
                isSelected={isMemberExist(randomAddress.address)}
                onIconClick={() => handleAddRemoveMember(randomAddress.address)}
              />
            )}
            {addresses.map((address: NameAddress) => {
              return (
                <ChatMember
                  address={address}
                  key={address.address}
                  isSelected={isMemberExist(address.address)}
                  onIconClick={() => handleAddRemoveMember(address.address)}
                />
              );
            })}
          </div>
          {addresses.length === 0 && !randomAddress && (
            <div>
              <div className={style.resultText}>
                No results in your contacts.
              </div>
              {user?.messagingPubKey.privacySetting ===
                PrivacySetting.Contacts && <ContactsOnlyMessage />}
            </div>
          )}
        </div>
      )}
      <div className={style.groupContainer}>
        <div className={style.initials}>
          {ReactHtmlParser(
            jazzicon(
              24,
              parseInt(fromBech32(walletAddress).data.toString(), 16)
            ).outerHTML
          )}
          <div className={style.groupHeader}>
            <span className={style.groupName}>
              <ToolTip
                tooltip={newGroupState.group.name}
                theme="dark"
                trigger="hover"
                options={{
                  placement: "top",
                }}
              >
                <div className={style.user}>
                  {formatGroupName(newGroupState.group.name)}
                </div>
              </ToolTip>
            </span>
            <span className={style.groupMembers}>
              {`${selectedMembers.length} member${
                selectedMembers.length > 1 ? "s" : ""
              }`}
            </span>
          </div>
        </div>

        <Button
          className={style.button}
          color="primary"
          data-loading={isLoading}
          disabled={
            newGroupState.isEditGroup ? newAddedMembers.length === 0 : undefined
          }
          onClick={() => {
            if (newGroupState.isEditGroup) {
              handleUpdateGroup();
            } else {
              history.push("/chat/group-chat/review-details");
            }
          }}
        >
          {newGroupState.isEditGroup ? "Update" : "Review"}
        </Button>
      </div>
    </HeaderLayout>
  );
});
