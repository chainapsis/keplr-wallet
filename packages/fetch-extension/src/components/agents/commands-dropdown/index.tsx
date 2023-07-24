import React from "react";
import { AGENT_COMMANDS } from "../../../config.ui.var";
import style from "./style.module.scss";
import { useSelector } from "react-redux";
import { userDetails } from "@chatStore/user-slice";

export const CommandsDropdown = ({
  newMessage,
  showDropdown,
  handleClick,
}: {
  newMessage: string;
  showDropdown: boolean;
  handleClick: (data: string) => void;
}) => {
  const { hasFET } = useSelector(userDetails);

  return (
    <React.Fragment>
      {showDropdown && (
        <div
          className={`${style["dropdown"]} ${
            hasFET ? style["enabled"] : style["disabled"]
          }`}
        >
          {!hasFET && (
            <div
              style={{ fontSize: "10px", color: "red", textAlign: "center" }}
            >
              Insufficient balance to execute automation
            </div>
          )}
          {AGENT_COMMANDS.filter(
            (command) => command.enabled && command.command.includes(newMessage)
          ).map((command) => (
            <CommandOption
              key={command.command}
              title={command.label}
              icon={command.icon}
              handleClick={() => (hasFET ? handleClick(command.command) : null)}
            />
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

const CommandOption = ({
  title,
  icon,
  handleClick,
}: {
  title: string;
  icon: any;
  handleClick: () => void;
}) => {
  return (
    <div onClick={() => handleClick()}>
      <img src={icon} alt="" draggable="false" /> {title}
    </div>
  );
};
