import React, { FunctionComponent } from "react";
import { Box } from "../../components/box";
import { YAxis } from "../../components/axis";
import { ColorPalette } from "../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { H1 } from "../../components/typography";
import { Gutter } from "../../components/gutter";
import { ChainImageFallback } from "../../components/image";
import { decorateMsgType } from "./decorate-msg-type";

export const IconBase: FunctionComponent<{
  type: string;
  chainId: string;
  noDecorateType?: boolean;
  icon: React.ReactElement;
}> = observer(({ type, chainId, noDecorateType, icon }) => {
  const { chainStore } = useStore();

  const modularChainInfo = chainStore.getModularChain(chainId);

  return (
    <Box>
      <YAxis alignX="center">
        {/* Icon Section */}
        <Box
          position="relative"
          marginTop="1.875rem"
          width="5rem"
          height="5rem"
          borderColor={ColorPalette["gray-400"]}
          borderWidth="2px"
          borderRadius="999px"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Icon */}
          {icon}

          {/* Chain image in bottom right */}
          <Box
            position="absolute"
            width="2.25rem"
            height="2.25rem"
            borderRadius="999px"
            style={{
              overflow: "hidden",
              right: "-0.25rem",
              bottom: "-0.25rem",
            }}
          >
            <ChainImageFallback chainInfo={modularChainInfo} size="2.25rem" />
          </Box>
        </Box>

        <Gutter size="1rem" />

        <H1
          color={ColorPalette["gray-50"]}
          style={{
            fontWeight: 600,
          }}
        >
          {noDecorateType ? type : decorateMsgType(type)}
        </H1>

        <Gutter size="1.5rem" />
      </YAxis>
    </Box>
  );
});
