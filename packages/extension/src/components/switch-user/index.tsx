import React from "react";
import { FunctionComponent } from "react";
import { useHistory } from "react-router";

export const SwitchUser: FunctionComponent = () => {
  const history = useHistory();

  return (
    <div
      style={{
        height: "64px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingRight: "20px",
      }}
    >
      <div
        style={{ width: "16px", cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault();

          history.push("/setting/set-keyring");
        }}
      >
        <i className="fa fa-user" aria-hidden="true" />
      </div>
    </div>
  );
};
