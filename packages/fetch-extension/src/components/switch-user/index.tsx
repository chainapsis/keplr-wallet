import React from "react";
import { FunctionComponent } from "react";
import { useNavigate } from "react-router";

export const SwitchUser: FunctionComponent = () => {
  const navigate = useNavigate();
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

          navigate("/setting/set-keyring");
        }}
      >
        <i
          className="fa fa-user"
          aria-hidden="true"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};
