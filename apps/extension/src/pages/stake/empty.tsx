import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { MainHeaderLayout } from "../main/layouts/header";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";

export const StakeEmptyPage: FunctionComponent = observer(() => {
  const theme = useTheme();

  return (
    <MainHeaderLayout
      headerContainerStyle={{
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor:
          theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-500"],
      }}
    >
      {/* TODO: Implement */}
    </MainHeaderLayout>
  );
});
