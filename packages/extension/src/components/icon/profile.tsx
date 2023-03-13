import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const ProfileIcon: FunctionComponent<IconProps> = ({
  width = 24,
  height = 24,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
        fill="#2E2E32"
      />
      <path
        d="M12 11C13.9338 11 15.5 9.43375 15.5 7.5C15.5 5.56625 13.9338 4 12 4C10.0662 4 8.5 5.56625 8.5 7.5C8.5 9.43375 10.0662 11 12 11ZM12 12.75C9.66375 12.75 5 13.9225 5 16.25V18H19V16.25C19 13.9225 14.3363 12.75 12 12.75Z"
        fill="#F2F2F7"
      />
    </svg>
  );
};
