import React from "react";
import style from "./style.module.scss";
import { useNavigate } from "react-router";
import { ButtonV2 } from "@components-v2/buttons/button";

export const TransxPending = () => {
  const navigate = useNavigate();

  return (
    <div className={style["container"]}>
      <img src={require("@assets/svg/wireframe/transx-pending.svg")} alt="" />
      <div className={style["title"]}>Transaction Pending</div>
      <div className={style["text"]}>
        Transaction has been broadcasted to blockchain and pending confirmation
      </div>
      <ButtonV2
        styleProps={{
          color: "white",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.6)",
          height: "56px",
        }}
        onClick={() => navigate("/")}
        text={"Go to homescreen"}
      />
    </div>
  );
};
