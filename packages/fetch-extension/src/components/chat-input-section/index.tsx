import React from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import { InputGroup } from "reactstrap";
import { ToolTip } from "@components/tooltip";
import paperAirplaneIcon from "@assets/icon/paper-airplane.png";
import style from "./style.module.scss";
import { FormattedMessage } from "react-intl";

export const ChatInputSection = (props: {
  value: string;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  isTargetPubKeyAvailable?: boolean | undefined;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
}) => {
  const {
    value,
    placeholder,
    disabled,
    isTargetPubKeyAvailable = true,
    onKeyDown,
    onClick,
    onChange,
  } = props;

  return (
    <div className={style["inputSection"]}>
      <div className={style["messageDisappear"]}>
        <img
          src={require("@assets/svg/ic-clock.svg")}
          draggable={false}
          alt="clock"
        />
        <FormattedMessage id="chat.disappear-message" />
      </div>
      <InputGroup className={style["inputText"]}>
        {isTargetPubKeyAvailable ? (
          <ReactTextareaAutosize
            maxRows={3}
            className={`${style["inputArea"]} ${style["sendMessageInputArea"]}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
          />
        ) : (
          <ToolTip
            trigger="hover"
            options={{ placement: "top" }}
            tooltip={<div>No transaction history found for this user</div>}
          >
            <ReactTextareaAutosize
              maxRows={3}
              className={`${style["inputArea"]} ${style["sendMessageInputArea"]}`}
              placeholder={placeholder}
              disabled={true}
            />
          </ToolTip>
        )}
        {value.length && value.trim() !== "" ? (
          <div className={style["sendMessageIcon"]} onClick={onClick}>
            <img draggable={false} src={paperAirplaneIcon} alt="" />
          </div>
        ) : (
          ""
        )}
      </InputGroup>
    </div>
  );
};
