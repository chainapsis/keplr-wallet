import React, { FunctionComponent } from "react";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import { Stack } from "../../../components/stack";
import { XAxis } from "../../../components/axis";

export const TokenInfos: FunctionComponent<{
  title: string;
  infos: {
    title: string;
    text: string;
  }[];
}> = ({ title, infos }) => {
  return (
    <Box paddingX="0.75rem">
      <Box paddingX="0.375rem" marginBottom="0.5rem">
        <Subtitle4 color={ColorPalette["gray-200"]}>{title}</Subtitle4>
      </Box>
      <Stack gutter="0.5rem">
        {infos.map((info, i) => {
          return (
            <Box
              key={i.toString()}
              backgroundColor={ColorPalette["gray-600"]}
              borderRadius="0.375rem"
              padding="1rem"
            >
              <XAxis alignY="center">
                <Subtitle3 color={ColorPalette["gray-200"]}>
                  {info.title}
                </Subtitle3>
                <div style={{ flex: 1 }} />
                <Subtitle3 color={ColorPalette["white"]}>{info.text}</Subtitle3>
              </XAxis>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
