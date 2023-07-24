import React from "react";
import style from "./style.module.scss";

export const AgentInfo = ({ handleClose }: { handleClose: any }) => {
  // address book values
  return (
    <React.Fragment>
      <div className={style["overlay"]} />
      <div className={style["popupContainer"]}>
        <div className={style["infoContainer"]}>
          <h3 style={{ textAlign: "center" }}>Agents can do more!!</h3>
          <p>Type / to access a list of commands such as</p>
          <img
            src={require("@assets/agent-commands.png")}
            style={{
              height: "120px",
              border: "1px solid grey",
              marginBottom: "10px",
              width: "100%",
            }}
          />
          <p>You can also ask me anything about FetchAI</p>
          <img
            src={require("@assets/agent-gpt.png")}
            style={{
              height: "120px",
              border: "1px solid grey",
              marginBottom: "10px",
              width: "100%",
            }}
          />
        </div>
        <button type="button" onClick={() => handleClose()}>
          Get Started
        </button>
      </div>
    </React.Fragment>
  );
};
