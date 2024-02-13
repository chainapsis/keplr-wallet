import React from "react";
import { useLocation, useNavigate } from "react-router";
import style from "./style.module.scss";
import { useStore } from "../../stores";

export const ChatActionsDropdown = ({
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
  return (
    <React.Fragment>
      {showDropdown && (
        <div className={style["dropdown"]}>
          {added ? <ViewContactOption /> : <AddContactOption />}
          {blocked ? (
            <UnblockOption handleClick={handleClick} />
          ) : (
            <BlockOption handleClick={handleClick} />
          )}
          {/* <div onClick={() => handleClick("delete")}>Delete chat</div> */}
        </div>
      )}
    </React.Fragment>
  );
};

const ViewContactOption = () => {
  const navigate = useNavigate();
  const { analyticsStore } = useStore();

  return (
    <div
      onClick={() => {
        analyticsStore.logEvent("address_book_click", { pageName: "Chat DM" });
        navigate("/setting/address-book");
      }}
    >
      View in address book
    </div>
  );
};

const AddContactOption = () => {
  const navigate = useNavigate();
  const { analyticsStore } = useStore();
  const userName = useLocation().pathname.split("/")[2];
  return (
    <div
      onClick={() => {
        analyticsStore.logEvent("add_new_address_click", {
          pageName: "Chat DM",
        });
        navigate("/setting/address-book", {
          state: {
            openModal: true,
            addressInputValue: userName,
          },
        });
      }}
    >
      Add to address book
    </div>
  );
};

const BlockOption = ({
  handleClick,
}: {
  handleClick: (data: string) => void;
}) => {
  const { analyticsStore } = useStore();

  return (
    <div
      onClick={() => {
        analyticsStore.logEvent("block_contact_click", { action: "Cancel" });
        handleClick("block");
      }}
    >
      Block contact
    </div>
  );
};

const UnblockOption = ({
  handleClick,
}: {
  handleClick: (data: string) => void;
}) => {
  const { analyticsStore } = useStore();

  return (
    <div
      onClick={() => {
        analyticsStore.logEvent("unblock_contact_click", { action: "Cancel" });
        handleClick("unblock");
      }}
    >
      Unblock contact
    </div>
  );
};
