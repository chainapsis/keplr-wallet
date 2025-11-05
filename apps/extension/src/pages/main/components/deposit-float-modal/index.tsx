import React, { FunctionComponent } from "react";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import { observer } from "mobx-react-lite";
import { FixedWidthSceneTransition } from "../../../../components/transition";
import { useTheme } from "styled-components";
import { ReferenceType, UseFloatingReturn } from "@floating-ui/react-dom";
import { CopyAddressSceneForFloatModal } from "./copy-address-scene-for-float-modal";
import { QRCodeScene } from "../deposit-modal/qr-code";

export const DepositFloatingModal: FunctionComponent<{
  close: () => void;
  floating: Pick<
    UseFloatingReturn<ReferenceType>,
    "x" | "y" | "strategy" | "refs"
  >;
}> = observer(({ close, floating }) => {
  const theme = useTheme();

  return (
    <Box
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-650"]
      }
      style={{
        position: floating.strategy,
        top: floating.y ?? 0,
        left: floating.x ?? 0,
        width: "336px",
        borderRadius: "0.75rem",
      }}
      ref={floating.refs.setFloating}
    >
      <FixedWidthSceneTransition
        scenes={[
          {
            name: "copy-address",
            element: CopyAddressSceneForFloatModal,
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
        borderRadius="0.75rem"
        transitionAlign="bottom"
      />
    </Box>
  );
});
