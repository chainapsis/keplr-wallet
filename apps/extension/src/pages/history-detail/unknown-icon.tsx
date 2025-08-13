import React, { FunctionComponent } from "react";
import { Box } from "../../components/box";
import { YAxis } from "../../components/axis";
import { ColorPalette } from "../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { H1 } from "../../components/typography";
import { Gutter } from "../../components/gutter";
import { ChainImageFallback } from "../../components/image";

export const UnknownIcon: FunctionComponent<{
  type: string;
  chainId: string;
}> = observer(({ type, chainId }) => {
  const { chainStore } = useStore();

  const modularChainInfo = chainStore.getModularChain(chainId);

  return (
    <Box>
      <YAxis alignX="center">
        {/* Icon Section */}
        <Box
          position="relative"
          width="4rem"
          height="4rem"
          backgroundColor={ColorPalette["gray-600"]}
          borderRadius="999px"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Question mark or default icon */}
          <Box
            style={{
              fontSize: "2rem",
              color: ColorPalette["white"],
              fontWeight: "bold",
            }}
          >
            ?
          </Box>

          {/* Chain image in bottom right */}
          <Box
            position="absolute"
            width="1.5rem"
            height="1.5rem"
            borderRadius="999px"
            style={{
              overflow: "hidden",
              border: `2px solid ${ColorPalette["gray-700"]}`,
            }}
          >
            <ChainImageFallback chainInfo={modularChainInfo} size="1.5rem" />
          </Box>
        </Box>

        <Gutter size="1rem" />

        <H1 color={ColorPalette["white"]}>{type}</H1>
      </YAxis>
    </Box>
  );
});
