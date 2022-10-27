import React from "react";
import { useHistory } from "react-router";
import style from "./style.module.scss";

export const Dropdown = ({
  added,
  blocked,
  showDropdown,
  handleClick,
}: {
  added: boolean;
  blocked: boolean;
  showDropdown: boolean;
  handleClick: (data: string) => void;
}) => {
  const history = useHistory();
  const userName = history.location.pathname.split("/")[2];

  return (
    <>
      {showDropdown && (
        <div className={style.dropdown}>
          {added ? (
            <div onClick={() => history.push("/setting/address-book")}>
              View in address book
            </div>
          ) : (
            <div
              onClick={() =>
                history.push({
                  pathname: "/setting/address-book",
                  state: {
                    openModal: true,
                    addressInputValue: userName,
                  },
                })
              }
            >
              Add to address book
            </div>
          )}
          {blocked ? (
            <div onClick={() => handleClick("unblock")}>Unblock contact</div>
          ) : (
            <div onClick={() => handleClick("block")}>Block contact</div>
          )}
          {/* <div onClick={() => handleClick("delete")}>Delete chat</div> */}
        </div>
      )}
    </>
  );
};
