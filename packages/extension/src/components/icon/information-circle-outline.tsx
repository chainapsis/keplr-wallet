import * as React from "react";
import { SVGProps } from "react";

export const InformationCircleOutline = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.6875 2.5C5.71836 2.5 2.5 5.71836 2.5 9.6875C2.5 13.6566 5.71836 16.875 9.6875 16.875C13.6566 16.875 16.875 13.6566 16.875 9.6875C16.875 5.71836 13.6566 2.5 9.6875 2.5Z"
      stroke={props.fill}
      strokeWidth="1.5"
      strokeMiterlimit="10"
    />
    <path
      d="M8.59375 8.59375H9.84375V13.125"
      stroke={props.fill}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.125 13.2812H11.5625"
      stroke={props.fill}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M9.6875 5.07812C9.48663 5.07812 9.29027 5.13769 9.12325 5.24929C8.95623 5.36089 8.82606 5.51951 8.74919 5.70509C8.67231 5.89067 8.6522 6.09488 8.69139 6.29189C8.73058 6.4889 8.82731 6.66987 8.96935 6.81191C9.11138 6.95395 9.29235 7.05068 9.48936 7.08987C9.68638 7.12905 9.89059 7.10894 10.0762 7.03207C10.2617 6.9552 10.4204 6.82502 10.532 6.65801C10.6436 6.49099 10.7031 6.29463 10.7031 6.09375C10.7031 5.82439 10.5961 5.56606 10.4057 5.3756C10.2152 5.18513 9.95686 5.07812 9.6875 5.07812Z"
      fill={props.fill}
    />
  </svg>
);
