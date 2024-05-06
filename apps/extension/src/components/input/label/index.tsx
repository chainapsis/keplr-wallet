import React, { FunctionComponent } from "react";
import { LoadingIcon } from "../../icon";
import { ColorPalette } from "../../../styles";
import { Columns } from "../../column";
import { Subtitle3 } from "../../typography";
import { useTheme } from "styled-components";

export const Label: FunctionComponent<{
  content: string;
  isLoading?: boolean;
}> = ({ content, isLoading }) => {
  const theme = useTheme();

  return (
    <Columns sum={1} gutter="0.25rem">
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-500"]
            : ColorPalette["gray-100"]
        }
        style={{ marginLeft: "0.5rem", marginBottom: "0.375rem" }}
      >
        {content}
      </Subtitle3>
      {isLoading ? (
        <LoadingIcon
          width="1rem"
          height="1rem"
          color={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
        />
      ) : null}
    </Columns>
  );
};
