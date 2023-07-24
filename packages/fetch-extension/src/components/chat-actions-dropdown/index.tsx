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
        analyticsStore.logEvent("Address book viewed");
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
        analyticsStore.logEvent("Add to address click");
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
        analyticsStore.logEvent("Block click");
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
        analyticsStore.logEvent("Unblock click");
        handleClick("unblock");
      }}
    >
      Unblock contact
    </div>
  );
};
