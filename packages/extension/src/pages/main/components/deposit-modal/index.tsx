import React, { FunctionComponent } from "react";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import { observer } from "mobx-react-lite";
import { FixedWidthSceneTransition } from "../../../../components/transition";
import { useTheme } from "styled-components";
import { CopyAddressScene } from "./copy-address-scene";
import { QRCodeScene } from "./qr-code";

export const DepositModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const theme = useTheme();

  return (
    <Box
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
    >
      <FixedWidthSceneTransition
        scenes={[
          {
            name: "copy-address",
            element: CopyAddressScene,
            width: "100%",
          },
          {
            name: "qr-code",
            element: QRCodeScene,
            width: "100%",
          },
        ]}
        initialSceneProps={{
          name: "copy-address",
          props: {
            close,
          },
        }}
        transitionAlign="bottom"
      />
    </Box>
  );
});
