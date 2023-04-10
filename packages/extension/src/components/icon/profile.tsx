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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.50009 6C7.50009 3.51472 9.51481 1.5 12.0001 1.5C14.4854 1.5 16.5001 3.51472 16.5001 6C16.5001 8.48528 14.4854 10.5 12.0001 10.5C9.51481 10.5 7.50009 8.48528 7.50009 6Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75133 20.1053C3.82867 15.6156 7.49207 12 12.0001 12C16.5082 12 20.1717 15.6157 20.2488 20.1056C20.254 20.4034 20.0824 20.676 19.8117 20.8002C17.4328 21.8918 14.7866 22.5 12.0004 22.5C9.21395 22.5 6.56752 21.8917 4.18841 20.7999C3.91774 20.6757 3.7462 20.4031 3.75133 20.1053Z"
        fill="currentColor"
      />
    </svg>
  );
};
