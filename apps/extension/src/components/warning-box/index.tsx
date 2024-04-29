import React, { FunctionComponent } from "react";
import { GuideBoxProps } from "../guide-box";
import { Box } from "../box";
import { IconProps } from "../icon/types";
import { Columns } from "../column";
import { Body3, H5 } from "../typography";
import { ColorPalette } from "../../styles";
import { Gutter } from "../gutter";
import { useTheme } from "styled-components";

export const WarningBox: FunctionComponent<Omit<GuideBoxProps, "color">> = ({
  title,
  paragraph,
}) => {
  const theme = useTheme();
  return (
    <Box padding="1.125rem">
      <Columns sum={1} alignY="center" gutter="0.25rem">
        <WarningIcon
          width="1.25rem"
          height="1.25rem"
          color={
            theme.mode === "light"
              ? ColorPalette["orange-400"]
              : ColorPalette["yellow-400"]
          }
        />
        <H5
          color={
            theme.mode === "light"
              ? ColorPalette["orange-400"]
              : ColorPalette["yellow-500"]
          }
        >
          {title}
        </H5>
      </Columns>

      <Gutter size="0.375rem" />

      <Body3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-400"]
            : ColorPalette["white"]
        }
      >
        {paragraph}
      </Body3>
    </Box>
  );
};

const WarningIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
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
        d="M9.40123 3.0034C10.5557 1.00229 13.4439 1.00229 14.5983 3.0034L21.9527 15.7509C23.1065 17.7509 21.6631 20.2501 19.3541 20.2501H4.64546C2.33649 20.2501 0.893061 17.7509 2.04691 15.7509L9.40123 3.0034ZM12 8.25C12.4142 8.25 12.75 8.58579 12.75 9V12.75C12.75 13.1642 12.4142 13.5 12 13.5C11.5858 13.5 11.25 13.1642 11.25 12.75V9C11.25 8.58579 11.5858 8.25 12 8.25ZM12 16.5C12.4142 16.5 12.75 16.1642 12.75 15.75C12.75 15.3358 12.4142 15 12 15C11.5858 15 11.25 15.3358 11.25 15.75C11.25 16.1642 11.5858 16.5 12 16.5Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
