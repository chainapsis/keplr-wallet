import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageVoteIcon: FunctionComponent<IconProps> = ({
  width = "2rem",
  height = "2rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_95_1786)">
        <path
          d="M12.9107 12.8651L11.1434 13.874C10.6539 14.1535 10.6539 14.8593 11.1434 15.1387L15.0811 17.3868C15.6195 17.6942 16.2804 17.6942 16.8188 17.3868L20.7565 15.1387C21.246 14.8593 21.246 14.1535 20.7565 13.874L18.7827 12.7471"
          stroke={color || "currentColor"}
        />
        <path
          d="M10.8537 14.835V20.0038C10.8537 20.322 11.0261 20.6151 11.3042 20.7697L15.0994 22.8792C15.6284 23.1732 16.2717 23.1735 16.8009 22.8799L20.0592 21.0723"
          stroke={color || "currentColor"}
          strokeLinecap="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.424 8.92963C19.6377 9.10449 19.6692 9.4195 19.4943 9.63323L16.274 13.8166C16.1803 13.9311 16.0407 13.9983 15.8928 14C15.7448 14.0017 15.6037 13.9377 15.5074 13.8254L13.0537 11C12.874 10.7903 12.8983 10.4747 13.108 10.295C13.3176 10.1153 13.6333 10.1396 13.813 10.3492L15.8781 12.7213L18.7204 8.99999C18.8952 8.78626 19.2103 8.75476 19.424 8.92963Z"
          fill={color || "currentColor"}
        />
      </g>
      <defs>
        <clipPath id="clip0_95_1786">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(8 8)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
