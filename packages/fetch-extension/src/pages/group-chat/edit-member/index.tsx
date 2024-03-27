import {
  CommonPopupOptions,
  Group,
  GroupChatMemberOptions,
  GroupDetails,
  GroupMembers,
  Groups,
  NewGroupDetails,
} from "@chatTypes";
import { AlertPopup } from "@components/chat-actions-popup/alert-popup";
import { ChatLoader } from "@components/chat-loader";
import { ChatMember } from "@components/chat-member";
import { GroupChatPopup } from "@components/group-chat-popup";
import { useLoadingIndicator } from "@components/loading-indicator";
import { createGroup } from "@graphQL/groups-api";
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import { HeaderLayout } from "@layouts/index";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";
import { encryptGroupMessage, GroupMessageType } from "@utils/encrypt-group";
import { fetchPublicKey } from "@utils/fetch-public-key";
import { formatAddress } from "@utils/format";
import {
  decryptEncryptedSymmetricKey,
  encryptSymmetricKey,
} from "@utils/symmetric-key";
import style from "./style.module.scss";
import { recieveMessages } from "@graphQL/recieve-messages";
import {
  addAdminEvent,
  removedAdminEvent,
  removeMemberEvent,
} from "@utils/group-events";
import { ChatErrorPopup } from "@components/chat-error-popup";

export const EditMember: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const loadingIndicator = useLoadingIndicator();
  const {
    chainStore,
    accountStore,
    queriesStore,
    uiConfigStore,
    analyticsStore,
    chatStore,
  } = useStore();

  const user = chatStore.userDetailsStore;

  /// For updating the current group
  const newGroupState: NewGroupDetails = chatStore.newGroupStore.newGroup;
  const [selectedMembers, setSelectedMembers] = useState<GroupMembers[]>(
    newGroupState.group.members || []
  );

  /// Group Info
  const groups: Groups = chatStore.messagesStore.userChatGroups;
  const group: Group = groups[newGroupState.group.groupId];

  /// Displaying list of addresses along with name
  const [addresses, setAddresses] = useState<any[]>([]);

  /// Selected member info for displaying the dynamic popup
  const [selectedAddress, setSelectedAddresse] = useState<any>();
  const [confirmAction, setConfirmAction] = useState(false);

  /// Show alert popup for remove member
  const [removeMemberPopup, setRemoveMemberPopup] = useState(false);

  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountInfo.bech32Address;
  const userGroupAddress = group.addresses.find(
    (address) => address.address == walletAddress
  );
  // address book values
  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    accountInfo.bech32Address,
    {
      allowHexAddressOnEthermint: true,
      icns: uiConfigStore.icnsInfo,
    }
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

  const updateUserAddresses = (members: GroupMembers[]) => {
    const userAddresses: any[] = members
      .reduce((acc: any[], element: GroupMembers) => {
        const addressData = addressBookConfig.addressBookDatas.find(
          (data) => data.address === element.address
        );
        if (addressData && addressData.address !== walletAddress) {
          return [
            ...acc,
            {
              name: addressData.name,
              address: addressData.address,
              existsInAddressBook: true,
            },
          ];
        } else {
          return element.address === walletAddress
            ? [
                {
                  name: "You",
                  address: walletAddress,
                  existsInAddressBook: false,
                },
                ...acc,
              ]
            : [
                ...acc,
                {
                  name: element.address,
                  address: element.address,
                  existsInAddressBook: false,
                },
              ];
        }
      }, [])
      .sort(function (a, b) {
        return b.address === walletAddress ? 0 : a.name.localeCompare(b.name);
      });
    setAddresses(userAddresses);
  };

  useEffect(() => {
    updateUserAddresses(selectedMembers);

    if (!newGroupState.isEditGroup) {
      /// Adding login user into the group list
      handleAddRemoveMember(
        walletAddress,
        group.addresses.find((element) => element.address === walletAddress)
          ?.isAdmin ?? false
      );
    }
  }, [addressBookConfig.addressBookDatas, selectedMembers]);

  /// Listening the live group updates
  useEffect(() => {
    const groupData = Object.values(groups).find((group) =>
      group.id.includes(newGroupState.group.groupId)
    );
    if (groupData) {
      const updatedMembers: GroupMembers[] = groupData.addresses
        .filter((element) => !element.removedAt)
        .map((element) => {
          return {
            address: element.address,
            pubKey: element.pubKey,
            encryptedSymmetricKey: element.encryptedSymmetricKey,
            isAdmin: element.isAdmin,
          };
        });
      setSelectedMembers(updatedMembers);
      chatStore.newGroupStore.setNewGroupInfo({ members: updatedMembers });
    }
  }, [groups, newGroupState.group.groupId]);

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
        //get symmetricKey of group using
        const symmetricKey = await decryptEncryptedSymmetricKey(
          current.chainId,
          userGroupAddress?.encryptedSymmetricKey || ""
        );
        const encryptedSymmetricKey = await encryptSymmetricKey(
          current.chainId,
          user.accessToken,
          symmetricKey,
          contactAddress
        );
        const tempMember: GroupMembers = {
          address: contactAddress,
          pubKey: pubAddr.publicKey,
          encryptedSymmetricKey,
          isAdmin: isAdmin || false,
        };

        const tempMembers = [...selectedMembers, tempMember];

        chatStore.newGroupStore.setNewGroupInfo({ members: tempMembers });
        setSelectedMembers(tempMembers);
      }
    } else {
      const tempMembers = selectedMembers.filter(
        (item) => item.address !== contactAddress
      );
      chatStore.newGroupStore.setNewGroupInfo({ members: tempMembers });
      setSelectedMembers(tempMembers);
    }
  };

  function showRemoveMemberPopup(action: CommonPopupOptions) {
    setRemoveMemberPopup(false);
    if (!selectedAddress) {
      return;
    }

    if (action === CommonPopupOptions.ok) {
      removeMember(selectedAddress.address);
    }
  }

  const removeMember = async (contactAddress: string) => {
    loadingIndicator.setIsLoading("group-action", true);

    const tempMembers = selectedMembers.filter(
      (item) => item.address !== contactAddress
    );

    try {
      const contents = await encryptGroupMessage(
        current.chainId,
        removeMemberEvent(contactAddress),
        GroupMessageType.event,
        userGroupAddress?.encryptedSymmetricKey || "",
        accountInfo.bech32Address,
        newGroupState.group.groupId,
        user.accessToken
      );
      const updatedGroupInfo: GroupDetails = {
        description: group.description ?? "",
        groupId: group.id,
        contents: contents,
        members: tempMembers,
        name: group.name,
        onlyAdminMessages: false,
      };
      const tempGroup = await createGroup(updatedGroupInfo, user.accessToken);

      if (tempGroup) {
        /// Updating the UI
        updateUserAddresses(tempMembers);
        /// updating the new updated group
        chatStore.newGroupStore.setNewGroupInfo({
          contents,
          members: tempMembers,
        });
        /// update state of selected member
        setSelectedMembers(tempMembers);

        /// updating the group(chat history) object
        const groups: any = { [tempGroup.id]: tempGroup };
        const pagination = chatStore.messagesStore.groupsPagination;
        chatStore.messagesStore.setGroups(groups, pagination);
        /// fetching the group messages again
        await recieveMessages(
          group.id,
          null,
          0,
          group.isDm,
          group.id,
          user.accessToken,
          chatStore.messagesStore
        );
        analyticsStore.logEvent("remove_group_member_click", {
          action: "Remove",
        });
      }
    } catch (e) {
      // Show error toaster
      console.error("error", e);
    } finally {
      loadingIndicator.setIsLoading("group-action", false);
    }
  };

  const updateAdminStatus = async (
    contactAddress: string,
    isAdmin: boolean
  ) => {
    const tempMember: GroupMembers | undefined = selectedMembers.find(
      (element) => element.address === contactAddress
    );

    if (tempMember) {
      loadingIndicator.setIsLoading("group-action", true);

      const updatedMember: GroupMembers = {
        address: tempMember.address,
        pubKey: tempMember.pubKey,
        encryptedSymmetricKey: tempMember.encryptedSymmetricKey,
        isAdmin: isAdmin || false,
      };

      const newMembers = selectedMembers.filter(
        (item) => item.address !== contactAddress
      );
      const tempMembers = [...newMembers, updatedMember];
      const statement = isAdmin
        ? addAdminEvent(contactAddress)
        : removedAdminEvent(contactAddress);
      const contents = await encryptGroupMessage(
        current.chainId,
        statement,
        GroupMessageType.event,
        userGroupAddress?.encryptedSymmetricKey || "",
        accountInfo.bech32Address,
        newGroupState.group.groupId,
        user.accessToken
      );
      const updatedGroupInfo: GroupDetails = {
        description: group.description ?? "",
        groupId: group.id,
        contents: contents,
        members: tempMembers,
        name: group.name,
        onlyAdminMessages: false,
      };

      try {
        const tempGroup = await createGroup(updatedGroupInfo, user.accessToken);

        if (tempGroup) {
          /// updating the new updated group
          chatStore.newGroupStore.setNewGroupInfo({
            contents,
            members: tempMembers,
          });
          setSelectedMembers(tempMembers);

          /// updating the group(chat history) object
          const groups: any = { [tempGroup.id]: tempGroup };
          const pagintaion = chatStore.messagesStore.groupsPagination;
          chatStore.messagesStore.setGroups(groups, pagintaion);
          /// fetching the group messages again
          await recieveMessages(
            group.id,
            null,
            0,
            group.isDm,
            group.id,
            user.accessToken,
            chatStore.messagesStore
          );
        }
      } catch (e) {
        // Show error toaster
        console.error("error", e);
      } finally {
        loadingIndicator.setIsLoading("group-action", false);
      }
    }
  };

  const AddContactOption = (address: string) => {
    analyticsStore.logEvent("add_new_address_click", {
      pageName: "Edit Member",
    });
    navigate("/setting/address-book", {
      state: {
        openModal: true,
        addressInputValue: address,
      },
    });
  };

  function showGroupPopup(address: any): void {
    if (address.address !== walletAddress) {
      setSelectedAddresse(address);
      setConfirmAction(true);
    }
  }

  function handlePopupAction(action: GroupChatMemberOptions) {
    setConfirmAction(false);

    if (!selectedAddress) {
      return;
    }

    switch (action) {
      case GroupChatMemberOptions.messageMember:
        analyticsStore.logEvent("dm_click", {
          pageName: "Edit Member",
        });
        navigate(`/chat/${selectedAddress.address}`);
        break;

      case GroupChatMemberOptions.addToAddressBook:
        AddContactOption(selectedAddress.address);
        break;

      case GroupChatMemberOptions.removeMember:
        setRemoveMemberPopup(true);
        analyticsStore.logEvent("remove_group_member_click", {
          action: "Cancel",
        });
        break;

      case GroupChatMemberOptions.makeAdminStatus:
        updateAdminStatus(selectedAddress.address, true);
        analyticsStore.logEvent("admin_status_click", {
          action: "Add",
        });
        break;

      case GroupChatMemberOptions.removeAdminStatus:
        updateAdminStatus(selectedAddress.address, false);
        analyticsStore.logEvent("admin_status_click", {
          pageName: "Remove",
        });
        break;

      case GroupChatMemberOptions.viewInAddressBook:
        analyticsStore.logEvent("address_book_click", {
          pageName: "Edit Member",
        });
        navigate("/setting/address-book");
        break;
    }
  }

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"New Group Chat"}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", {
          pageName: "Edit Member",
        });
        navigate(-1);
      }}
    >
      <ChatErrorPopup />
      <div className={style["group"]}>
        <div className={style["groupContainer"]}>
          <div className={style["groupHeader"]}>
            <span className={style["groupName"]}>{group.name}</span>
            <span className={style["groupMembers"]}>
              {`${addresses.length} member${addresses.length > 1 ? "s" : ""}`}
              <i
                className={"fa fa-user-plus"}
                aria-hidden="true"
                onClick={() => {
                  analyticsStore.logEvent("add_group_member_click", {
                    pageName: "Edit Member",
                  });
                  navigate({
                    pathname: "/chat/group-chat/add-member",
                  });
                }}
              />
            </span>
          </div>
        </div>
        <span className={style["groupDescription"]}>{group.description}</span>
        {!addressBookConfig.isLoaded ? (
          <ChatLoader message="Loading contacts, please wait..." />
        ) : (
          <div className={style["newMemberContainer"]}>
            <div className={style["membersContainer"]}>
              {addresses.map((address: any) => {
                return (
                  <ChatMember
                    address={address}
                    key={address.address}
                    isShowAdmin={
                      selectedMembers.find(
                        (element) => element.address === address.address
                      )?.isAdmin ?? false
                    }
                    showPointer
                    showSelectedIcon={false}
                    onClick={() => showGroupPopup(address)}
                  />
                );
              })}
            </div>
          </div>
        )}
        {removeMemberPopup && (
          <AlertPopup
            setConfirmAction={setConfirmAction}
            heading={`Remove ${formatAddress(selectedAddress?.name ?? "")}`}
            description={`${formatAddress(
              selectedAddress?.name ?? ""
            )} will no longer receive messages from this group. \nThe group will be notified that they have been removed.`}
            firstButtonTitle="Cancel"
            secondButtonTitle="Remove"
            onClick={(action) => {
              showRemoveMemberPopup(action);
            }}
          />
        )}
        {confirmAction && (
          <GroupChatPopup
            isAdded={selectedAddress.existsInAddressBook}
            isFromReview={false}
            name={selectedAddress?.name ?? ""}
            selectedMember={selectedMembers.find(
              (element) => element.address === selectedAddress?.address
            )}
            isLoginUserAdmin={
              group.addresses.find(
                (element) => element.address === walletAddress
              )?.isAdmin ?? false
            }
            onClick={(action) => {
              handlePopupAction(action);
            }}
          />
        )}
      </div>
    </HeaderLayout>
  );
});
