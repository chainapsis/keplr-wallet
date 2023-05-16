import React, { FunctionComponent } from "react";
import { LoadingIcon } from "../../icon";
import { ColorPalette } from "../../../styles";
import { Columns } from "../../column";
import { Subtitle3 } from "../../typography";

export const Label: FunctionComponent<{
  content: string;
  isLoading?: boolean;
}> = ({ content, isLoading }) => {
  return (
    <Columns sum={1} gutter="0.25rem">
      <Subtitle3
        color={ColorPalette["gray-100"]}
        style={{ marginLeft: "0.5rem", marginBottom: "0.375rem" }}
      >
        {content}
      </Subtitle3>
      {isLoading ? (
        <LoadingIcon
          width="1rem"
          height="1rem"
          color={ColorPalette["gray-300"]}
        />
      ) : null}
    </Columns>
  );
};
