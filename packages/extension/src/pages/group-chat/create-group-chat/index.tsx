import React, { FunctionComponent, useState } from "react";
import { useHistory } from "react-router";
import { HeaderLayout } from "@layouts/index";
import style from "./style.module.scss";
import { store } from "@chatStore/index";
import {
  newGroupDetails,
  setIsGroupEdit,
  setNewGroupInfo,
} from "@chatStore/new-group-slice";
import { useSelector } from "react-redux";
import { CommonPopupOptions, GroupDetails, NewGroupDetails } from "@chatTypes";
import { useNotification } from "@components/notification";
import { Button } from "reactstrap";
import { encryptGroupMessage, GroupMessageType } from "@utils/encrypt-group";
import { useStore } from "../../../stores";
import { userDetails } from "@chatStore/user-slice";
import { AlertPopup } from "@components/chat-actions-popup/alert-popup";
import { createGroup } from "@graphQL/groups-api";
import { setGroups } from "@chatStore/messages-slice";
import { recieveMessages } from "@graphQL/recieve-messages";
import { createGroupEvent, updateInfoEvent } from "@utils/group-events";
import amplitude from "amplitude-js";
import { ChatErrorPopup } from "@components/chat-error-popup";

export const CreateGroupChat: FunctionComponent = () => {
  const history = useHistory();
  const notification = useNotification();
  const user = useSelector(userDetails);

  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const newGroupState: NewGroupDetails = useSelector(newGroupDetails);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState(newGroupState.group.name);
  const [description, setDescription] = useState(
    newGroupState.group.description
  );

  const [confirmAction, setConfirmAction] = useState<boolean>(false);

  async function updateGroupInfo() {
    setIsLoading(true);
    const groupAddresses = newGroupState.group.members;
    const userGroupAddress = groupAddresses.find(
      (address) => address.address == accountInfo.bech32Address
    );
    const encryptedSymmetricKey = userGroupAddress?.encryptedSymmetricKey || "";
    const contents = await encryptGroupMessage(
      current.chainId,
      updateInfoEvent(accountInfo.bech32Address),
      GroupMessageType.event,
      encryptedSymmetricKey,
      accountInfo.bech32Address,
      newGroupState.group.groupId,
      user.accessToken
    );
    const updatedGroupInfo: GroupDetails = {
      description: description,
      groupId: newGroupState.group.groupId,
      contents: contents,
      members: newGroupState.group.members,
      name: name,
      onlyAdminMessages: false,
    };
    const group = await createGroup(updatedGroupInfo);

    if (group) {
      /// updating the group(chat history) object
      const groups: any = { [group.id]: group };
      store.dispatch(setGroups({ groups }));
      /// fetching the group messages again
      await recieveMessages(group.id, null, 0, group.isDm, group.id);
      amplitude.getInstance().logEvent("Group info updated", {
        from: "Group Info",
      });
      history.goBack();
    }
    setIsLoading(false);
  }

  async function validateAndContinue(): Promise<void> {
    if (newGroupState.isEditGroup) {
      updateGroupInfo();
      return;
    }

    if (!name) {
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: `Please enter the group name`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
      return;
    }

    const contents = {
      text: createGroupEvent(accountInfo.bech32Address),
      type: GroupMessageType[GroupMessageType.event],
    };

    store.dispatch(
      setNewGroupInfo({
        name: name.trim(),
        description: description.trim(),
        contents,
      })
    );
    store.dispatch(setIsGroupEdit(false));
    history.push({
      pathname: "/chat/group-chat/add-member",
    });
  }

  async function handlePopupAction(action: CommonPopupOptions) {
    setConfirmAction(false);

    if (action === CommonPopupOptions.ok) {
      history.goBack();
    }
  }

  function handleBackButton() {
    if (newGroupState.isEditGroup) {
      if (
        newGroupState.group.name != name ||
        name.trim().length == 0 ||
        newGroupState.group.description != description
      ) {
        setConfirmAction(true);
        return;
      }
    }

    history.goBack();
  }

  function isBtnDisable(): boolean | undefined {
    if (newGroupState.isEditGroup) {
      return (
        (newGroupState.group.name == name &&
          newGroupState.group.description == description) ||
        name.trim().length == 0
      );
    }

    return name.trim().length == 0;
  }

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"New Group Chat"}
      onBackButton={() => handleBackButton()}
    >
      <ChatErrorPopup />
      <div>
        {confirmAction && (
          <AlertPopup
            setConfirmAction={setConfirmAction}
            heading="Discard changes"
            description="Leaving this page without saving changes will not save changes made"
            firstButtonTitle="Cancel"
            secondButtonTitle="Leave without saving"
            onClick={(action) => {
              handlePopupAction(action);
            }}
          />
        )}
      </div>
      <div className={style.tokens}>
        <span className={style.groupImageText} hidden={true}>
          Group Image (Optional)
        </span>
        <img
          className={style.groupImage}
          draggable="false"
          src={require("@assets/group710.svg")}
        />
        <span className={style.recommendedSize}>
          Recommended size: 120 x 120
        </span>
        <div className={style.input}>
          <span className={style.text}>Group Name</span>
          <input
            className={style.inputText}
            placeholder="Type your group chat name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value.substring(0, 30));
            }}
          />
        </div>
        <div className={style.input}>
          <span className={style.text}>Description (Optional)</span>
          <textarea
            className={style.inputText}
            placeholder="Tell us more about your group"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value.substring(0, 256));
            }}
          />
        </div>
        <div className={style.adminToggle}>
          <img
            draggable={false}
            className={style.toggle}
            src={require("@assets/toggle.svg")}
          />
          <span className={style.adminText}>Only admins can send messages</span>
        </div>
        <Button
          className={style.button}
          color="primary"
          data-loading={isLoading}
          disabled={isBtnDisable()}
          onClick={() => validateAndContinue()}
        >
          {newGroupState.isEditGroup ? "Save changes" : "Add Members"}
        </Button>
      </div>
    </HeaderLayout>
  );
};
