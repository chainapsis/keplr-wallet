import React, { useMemo } from "react";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Caption1 } from "../../../../components/typography";
import { KeyInfo } from "@keplr-wallet/background";
import { stringLengthByGrapheme } from "../../../../utils/string";

export const AccountNameIcon = ({
  keyInfoType,
  name,
  style,
}: {
  keyInfoType?: KeyInfo["type"];
  name: string;
  style?: React.CSSProperties;
}) => {
  const theme = useTheme();

  const firstLetter = useMemo(() => {
    if (stringLengthByGrapheme(name) !== name.length) {
      return "A";
    }
    return name[0].toUpperCase();
  }, [name]);

  const content = useMemo(() => {
    switch (keyInfoType) {
      case "ledger":
        return theme.mode === "light" ? <_LedgerIconLM /> : <_LedgerIconDM />;
      case "keystone":
        return theme.mode === "light" ? (
          <_KeystoneIconLM />
        ) : (
          <_KeystoneIconDM />
        );
      default:
        return (
          <Caption1
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            {firstLetter}
          </Caption1>
        );
    }
  }, [firstLetter, keyInfoType, theme.mode]);

  return (
    <div
      style={{
        width: "1.5rem",
        height: "1.5rem",
        borderRadius: "9999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:
          theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-550"],
        flexShrink: 0,
        ...(style ?? {}),
      }}
    >
      {content}
    </div>
  );
};

const _LedgerIconLM = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#DCDCE3" />
      <g clipPath="url(#clip0_2649_11332)">
        <path
          d="M5 14.6259V18.0465H10.266V17.2879H5.76727V14.6259H5ZM18.2327 14.6259V17.2879H13.734V18.0463H19V14.6259H18.2327ZM10.2736 9.42057V14.6258H13.734V13.9417H11.0409V9.42057H10.2736ZM5 6V9.42057H5.76727V6.75841H10.266V6H5ZM13.734 6V6.75841H18.2327V9.42057H19V6H13.734Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_2649_11332">
          <rect
            width="14"
            height="12.0465"
            fill="white"
            transform="translate(5 6)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const _LedgerIconDM = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#242428" />
      <g clipPath="url(#clip0_2649_11348)">
        <path
          d="M5 14.6259V18.0465H10.266V17.2879H5.76727V14.6259H5ZM18.2327 14.6259V17.2879H13.734V18.0463H19V14.6259H18.2327ZM10.2736 9.42057V14.6258H13.734V13.9417H11.0409V9.42057H10.2736ZM5 6V9.42057H5.76727V6.75841H10.266V6H5ZM13.734 6V6.75841H18.2327V9.42057H19V6H13.734Z"
          fill="#FEFEFE"
        />
      </g>
      <defs>
        <clipPath id="clip0_2649_11348">
          <rect
            width="14"
            height="12.0465"
            fill="white"
            transform="translate(5 6)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const _KeystoneIconLM = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#DCDCE3" />
      <path d="M7 6.5H13L9 15H6L7 6.5Z" fill="black" />
      <path d="M17 17.5H11L15 9H18L17 17.5Z" fill="#1F5AFF" />
    </svg>
  );
};

const _KeystoneIconDM = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#242428" />
      <path d="M7 6.5H13L9 15H6L7 6.5Z" fill="#F5F8FF" />
      <path d="M17 17.5H11L15 9H18L17 17.5Z" fill="#3D71FF" />
    </svg>
  );
};
