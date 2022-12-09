/* eslint-disable react-hooks/exhaustive-deps */
import amplitude from "amplitude-js";
import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { userBlockedAddresses } from "../../chatStore/messages-slice";
import style from "./style.module.scss";

export const NewUserSection = ({
  userName,
  handleClick,
}: {
  userName: string;
  handleClick: any;
}) => {
  const history = useHistory();

  const blockedUsers = useSelector(userBlockedAddresses);

  return (
    <div className={style.contactsContainer}>
      <div className={style.displayText}>
        This contact is not saved in your address book
      </div>
      <div className={style.buttons}>
        <button
          style={{ padding: "4px 20px" }}
          onClick={() => {
            amplitude.getInstance().logEvent("Add to address click", {});
            history.push({
              pathname: "/setting/address-book",
              state: {
                openModal: true,
                addressInputValue: userName,
              },
            });
          }}
        >
          Add
        </button>
        {blockedUsers[userName] ? (
          <button
            onClick={() => {
              amplitude.getInstance().logEvent("Unblock click", {});
              handleClick("unblock");
            }}
          >
            Unblock
          </button>
        ) : (
          <button
            onClick={() => {
              amplitude.getInstance().logEvent("Block click", {});
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
