/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { userBlockedAddresses } from "@chatStore/messages-slice";
import style from "./style.module.scss";
import { useStore } from "../../stores";

export const NewUserSection = ({
  targetAddress,
  handleClick,
}: {
  targetAddress: string;
  handleClick: any;
}) => {
  const navigate = useNavigate();
  const { analyticsStore } = useStore();

  const blockedUsers = useSelector(userBlockedAddresses);

  return (
    <div className={style["contactsContainer"]}>
      <div className={style["displayText"]}>
        This contact is not saved in your address book
      </div>
      <div className={style["buttons"]}>
        <button
          style={{ padding: "4px 20px" }}
          onClick={() => {
            analyticsStore.logEvent("Add to address click");
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
              analyticsStore.logEvent("Unblock click");
              handleClick("unblock");
            }}
          >
            Unblock
          </button>
        ) : (
          <button
            onClick={() => {
              analyticsStore.logEvent("Block click");
              handleClick("block");
            }}
          >
            Block
          </button>
        )}
      </div>
    </div>
  );
};
