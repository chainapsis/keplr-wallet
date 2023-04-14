import React, { FunctionComponent } from "react";
import { CheckBoxProps } from "./index";
import { Styles } from "./styles";

export const Checkbox: FunctionComponent<CheckBoxProps> = ({
  checked = false,
  disabled = false,
}) => {
  const [isChecked, setIsChecked] = React.useState(checked);

  return (
    <Styles.CheckBoxContainer
      checked={isChecked}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          setIsChecked(!isChecked);
        }
      }}
    >
      <Styles.HiddenCheckBox checked={isChecked} disabled={disabled} />
      {isChecked ? (
        <svg
          width="14"
          height="11"
          viewBox="0 0 14 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.8926 7.97775L1.85988 4.94502L0.827148 5.97048L4.8926 10.0359L13.6199 1.30866L12.5944 0.283203L4.8926 7.97775Z"
            fill="currentColor"
          />
        </svg>
      ) : disabled ? (
        <svg
          width="12"
          height="2"
          viewBox="0 0 12 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.58105 1.0752H10.3083"
            stroke="currentColor"
            strokeWidth="1.635"
            strokeLinecap="square"
          />
        </svg>
      ) : null}
    </Styles.CheckBoxContainer>
  );
};
