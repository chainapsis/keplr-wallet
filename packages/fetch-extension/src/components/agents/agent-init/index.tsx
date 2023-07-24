import React from "react";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";
import { AGENT_ADDRESS } from "../../../config.ui.var";
import style from "./style.module.scss";

export const AgentInit = () => {
  const navigate = useNavigate();
  // address book values
  const { chainStore } = useStore();
  const current = chainStore.current;
  return (
    <div className={style["agentContainer"]}>
      <img src={require("@assets/svg/fetchbot.svg")} />
      <br />
      <div className={style["infoContainer"]}>
        <h3>We have just added Agents!</h3>
        <p>
          Now you can chat with an autonomous agent to ask questions and perform
          wallet functions.
        </p>
      </div>
      <button
        type="button"
        onClick={() =>
          navigate("/chat/agent/" + AGENT_ADDRESS[current.chainId], {
            replace: true,
          })
        }
      >
        Talk to an Agent
      </button>
    </div>
  );
};
