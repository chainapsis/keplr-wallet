/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useNavigate } from "react-router";
import style from "./style.module.scss";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";

export const NewUserSection = observer(
  ({
    targetAddress,
    handleClick,
  }: {
    targetAddress: string;
    handleClick: any;
  }) => {
    const navigate = useNavigate();
    const { analyticsStore, chatStore } = useStore();

    const blockedUsers = chatStore.messagesStore.blockedAddress;
    return (
      <div className={style["contactsContainer"]}>
        <div className={style["displayText"]}>
          This contact is not saved in your address book
        </div>
        <div className={style["buttons"]}>
          <button
            style={{ padding: "4px 20px" }}
            onClick={() => {
              analyticsStore.logEvent("add_new_address_click", {
                pageName: "Chat DM",
              });
              navigate("/setting/address-book", {
                state: {
                  openModal: true,
                  addressInputValue: targetAddress,
                },
              });
            }}
          >
            Add
          </button>
          {blockedUsers[targetAddress] ? (
            <button
              onClick={() => {
                analyticsStore.logEvent("unblock_contact_click", {
                  action: "Cancel",
                });
                handleClick("unblock");
              }}
            >
              Unblock
            </button>
          ) : (
            <button
              onClick={() => {
                analyticsStore.logEvent("block_contact_click", {
                  action: "Cancel",
                });
                handleClick("block");
              }}
            >
              Block
            </button>
          )}
        </div>
      </div>
    );
  }
);
