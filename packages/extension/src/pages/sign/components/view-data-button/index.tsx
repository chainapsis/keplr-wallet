import React, { FunctionComponent } from "react";
import { XAxis } from "../../../../components/axis";
import { Button2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { FormattedMessage } from "react-intl";
import { useTheme } from "styled-components";

export const ViewDataButton: FunctionComponent<{
  isViewData: boolean;
  setIsViewData: (value: boolean) => void;
}> = ({ isViewData, setIsViewData }) => {
  const theme = useTheme();
  return (
    <Box
      cursor="pointer"
      onClick={(e) => {
        e.preventDefault();

        setIsViewData(!isViewData);
      }}
      style={{
        color:
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-100"],
      }}
    >
      <XAxis alignY="center">
        <Button2>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </Button2>
        <Gutter size="0.25rem" />
        {isViewData ? <IconClose size="0.75rem" /> : <IconXML size="0.75rem" />}
      </XAxis>
    </Box>
  );
};

const IconXML: FunctionComponent<{
  size: string;
}> = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 12 12"
    >
      <g clipPath="url(#clip0_1897_22646)">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
          d="M9.125 3.375L11.75 6 9.125 8.625m-5.25 0L1.25 6l2.625-2.625m3.75-1.5l-2.25 8.25"
        />
      </g>
      <defs>
        <clipPath id="clip0_1897_22646">
          <path fill="#fff" d="M0 0H12V12H0z" transform="translate(.5)" />
        </clipPath>
      </defs>
    </svg>
  );
};

const IconClose: FunctionComponent<{
  size: string;
}> = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};
