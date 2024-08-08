import React, { FunctionComponent } from "react";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import { Stack } from "../../../components/stack";
import { XAxis } from "../../../components/axis";
import { useTheme } from "styled-components";

export const TokenInfos: FunctionComponent<{
  title: string;
  infos: {
    title: string;
    text: string;
    textDeco?: "green";
  }[];
}> = ({ title, infos }) => {
  const theme = useTheme();

  return (
    <Box paddingX="0.75rem">
      <Box paddingX="0.375rem" marginBottom="0.5rem">
        <Subtitle4
          color={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-200"]
          }
        >
          {title}
        </Subtitle4>
      </Box>
      <Stack gutter="0.5rem">
        {infos.map((info, i) => {
          return (
            <Box
              key={i.toString()}
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["white"]
                  : ColorPalette["gray-650"]
              }
              borderRadius="0.375rem"
              padding="1rem"
              style={{
                boxShadow:
                  theme.mode === "light"
                    ? "0 1px 4px 0 rgba(43,39,55,0.1)"
                    : undefined,
              }}
            >
              <XAxis alignY="center">
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"]
                  }
                >
                  {info.title}
                </Subtitle3>
                <div style={{ flex: 1 }} />
                <Subtitle3
                  color={(() => {
                    if (info.textDeco === "green") {
                      return theme.mode === "light"
                        ? ColorPalette["green-500"]
                        : ColorPalette["green-400"];
                    }

                    return theme.mode === "light"
                      ? ColorPalette["black"]
                      : ColorPalette["white"];
                  })()}
                >
                  {info.text}
                </Subtitle3>
              </XAxis>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
