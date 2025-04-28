import React, { FunctionComponent, forwardRef, useState } from "react";
import { TextInput } from ".";
import { ColorPalette } from "../../../styles";
import { useTheme } from "styled-components";
import { TextInputProps } from "./types";
import { useIntl } from "react-intl";

export interface PasswordTextInputProps
  extends Omit<
    TextInputProps & React.InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  inputStyle?: React.CSSProperties;
}

// eslint-disable-next-line react/display-name
export const PasswordTextInput = forwardRef<
  HTMLInputElement,
  PasswordTextInputProps
>(({ inputStyle, ...props }, ref) => {
  const intl = useIntl();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <TextInput
      ref={ref}
      type={isPasswordVisible ? "text" : "password"}
      autoComplete="off"
      right={
        <VisibilityIconButton
          isVisible={isPasswordVisible}
          onClick={() => setIsPasswordVisible((prev) => !prev)}
        />
      }
      label={intl.formatMessage({
        id: "components.input.password-text-input.label",
      })}
      placeholder={intl.formatMessage({
        id: "components.input.password-text-input.placeholder",
      })}
      inputStyle={inputStyle}
      {...props}
    />
  );
});

const VisibilityIconButton: FunctionComponent<{
  isVisible: boolean;
  onClick: () => void;
}> = ({ isVisible, onClick }) => {
  const theme = useTheme();
  const [isHover, setIsHover] = useState(false);

  const fillColor =
    theme.mode === "light"
      ? isHover
        ? ColorPalette["gray-100"]
        : ColorPalette["gray-200"]
      : isHover
      ? ColorPalette["gray-400"]
      : ColorPalette["gray-300"];

  const strokeColor =
    theme.mode === "light" ? ColorPalette["white"] : ColorPalette["gray-700"];

  return (
    <div
      style={{
        width: "1.75rem",
        height: "1.75rem",
        cursor: "pointer",
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {isVisible ? (
        <VisibleIcon width="1.75rem" height="1.75rem" color={fillColor} />
      ) : (
        <InvisibleIcon
          width="1.75rem"
          height="1.75rem"
          fillColor={fillColor}
          strokeColor={strokeColor}
        />
      )}
    </div>
  );
};

const InvisibleIcon: FunctionComponent<{
  width: string;
  height: string;
  fillColor: string;
  strokeColor: string;
}> = ({ width, height, fillColor, strokeColor }) => {
  return (
    <div style={{ width, height }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.0833 6.58203C11.029 6.58203 8.28267 7.8082 6.304 9.3272C5.31233 10.0879 4.49917 10.9325 3.92867 11.7539C3.36867 12.5612 3 13.4082 3 14.1654C3 14.9225 3.36983 15.7695 3.92867 16.5757C4.50033 17.3982 5.31233 18.2429 6.304 19.0024C8.28267 20.5237 11.029 21.7487 14.0833 21.7487C17.1377 21.7487 19.884 20.5225 21.8627 19.0035C22.8543 18.2429 23.6675 17.3982 24.2368 16.5769C24.7968 15.7695 25.1667 14.9225 25.1667 14.1654C25.1667 13.4082 24.7968 12.5612 24.2368 11.755C23.6675 10.9325 22.8543 10.0879 21.8627 9.32836C19.884 7.80703 17.1377 6.58203 14.0833 6.58203ZM9.70833 14.1654C9.70833 13.005 10.1693 11.8922 10.9897 11.0718C11.8102 10.2513 12.923 9.79036 14.0833 9.79036C15.2437 9.79036 16.3565 10.2513 17.1769 11.0718C17.9974 11.8922 18.4583 13.005 18.4583 14.1654C18.4583 15.3257 17.9974 16.4385 17.1769 17.259C16.3565 18.0794 15.2437 18.5404 14.0833 18.5404C12.923 18.5404 11.8102 18.0794 10.9897 17.259C10.1693 16.4385 9.70833 15.3257 9.70833 14.1654Z"
          fill={fillColor}
        />
        <path
          d="M7.0835 6L22.2502 21.1667"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.9165 7.16602L20.4998 21.7493"
          stroke={fillColor}
          strokeWidth="2.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const VisibleIcon: FunctionComponent<{
  width: string;
  height: string;
  color: string;
}> = ({ width, height, color }) => {
  return (
    <div style={{ width, height }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          d="M14.0835 10.959C13.3873 10.959 12.7196 11.2355 12.2273 11.7278C11.7351 12.2201 11.4585 12.8878 11.4585 13.584C11.4585 14.2802 11.7351 14.9479 12.2273 15.4401C12.7196 15.9324 13.3873 16.209 14.0835 16.209C14.7797 16.209 15.4474 15.9324 15.9397 15.4401C16.4319 14.9479 16.7085 14.2802 16.7085 13.584C16.7085 12.8878 16.4319 12.2201 15.9397 11.7278C15.4474 11.2355 14.7797 10.959 14.0835 10.959Z"
          fill={color}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.0833 6C11.029 6 8.28267 7.22617 6.304 8.74517C5.31233 9.50583 4.49917 10.3505 3.92867 11.1718C3.36867 11.9792 3 12.8262 3 13.5833C3 14.3405 3.36983 15.1875 3.92867 15.9937C4.50033 16.8162 5.31233 17.6608 6.304 18.4203C8.28267 19.9417 11.029 21.1667 14.0833 21.1667C17.1377 21.1667 19.884 19.9405 21.8627 18.4215C22.8543 17.6608 23.6675 16.8162 24.2368 15.9948C24.7968 15.1875 25.1667 14.3405 25.1667 13.5833C25.1667 12.8262 24.7968 11.9792 24.2368 11.173C23.6675 10.3505 22.8543 9.50583 21.8627 8.74633C19.884 7.225 17.1377 6 14.0833 6ZM9.70833 13.5833C9.70833 12.423 10.1693 11.3102 10.9897 10.4897C11.8102 9.66927 12.923 9.20833 14.0833 9.20833C15.2437 9.20833 16.3565 9.66927 17.1769 10.4897C17.9974 11.3102 18.4583 12.423 18.4583 13.5833C18.4583 14.7437 17.9974 15.8565 17.1769 16.6769C16.3565 17.4974 15.2437 17.9583 14.0833 17.9583C12.923 17.9583 11.8102 17.4974 10.9897 16.6769C10.1693 15.8565 9.70833 14.7437 9.70833 13.5833Z"
          fill={color}
        />
      </svg>
    </div>
  );
};
