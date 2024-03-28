import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";

// 얘는 observer 시스템을 쓰지 않기 때문에
// 그냥 대충 UI에 맞춰서 구현하면 된다
export const MsgItemSkeleton: FunctionComponent = () => {
  return (
    <Box
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="0.375rem"
      paddingX="1rem"
      paddingY="0.875rem"
      minHeight="4rem"
      alignY="center"
    >
      <XAxis alignY="center">
        <Box marginRight="0.75rem">
          <XAxis alignY="center">
            <Box
              width="2rem"
              height="2rem"
              borderRadius="99999px"
              backgroundColor={ColorPalette["gray-500"]}
            />
          </XAxis>
        </Box>
        <div
          style={{
            flex: 1,
            minWidth: "0.75rem",
          }}
        >
          <XAxis alignY="center">
            <YAxis>
              <Box
                width="3.25rem"
                height="0.75rem"
                backgroundColor={ColorPalette["gray-500"]}
              />
              <Gutter size="0.625rem" />
              <Box
                width="4.5rem"
                height="0.75rem"
                backgroundColor={ColorPalette["gray-500"]}
              />
            </YAxis>

            <div
              style={{
                flex: 1,
              }}
            />
            <YAxis alignX="right">
              <Box
                width="3.25rem"
                height="0.75rem"
                backgroundColor={ColorPalette["gray-500"]}
              />
              <Gutter size="0.625rem" />
              <Box
                width="4.5rem"
                height="0.75rem"
                backgroundColor={ColorPalette["gray-500"]}
              />
            </YAxis>
          </XAxis>
        </div>
      </XAxis>
    </Box>
  );
};
