import React, { FunctionComponent } from "react";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import Color from "color";
import { ColorPalette } from "../../../../styles";
import { Column, Columns } from "../../../../components/column";
import { Subtitle2 } from "../../../../components/typography";
import { YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { CheckIcon, LinkItem, PinView, TwitterIcon } from "./components";
import { Styles } from "./styled";

export const WelcomePage: FunctionComponent = () => {
  return (
    <Styles.Container>
      <PinView />

      <Stack alignX="left">
        <Box
          padding="0.5rem 1rem"
          borderRadius="1.5rem"
          backgroundColor={Color(ColorPalette["green-600"])
            .alpha(0.25)
            .toString()}
        >
          <Columns sum={1} gutter="0.625rem">
            <CheckIcon />
            <Subtitle2 color={ColorPalette["green-400"]}>
              You’re all set Cosmonaut!
            </Subtitle2>
          </Columns>
        </Box>

        <Gutter size="0.75rem" />

        <Styles.ResponsiveContainer>
          <Box width="37.5rem">
            <YAxis alignX="left">
              <Box
                width="31.25rem"
                style={{ fontWeight: 600, fontSize: "3.5rem" }}
              >
                Welcome aboard the Interchain!
              </Box>

              <Gutter size="0.75rem" />

              <Box style={{ fontWeight: 500, fontSize: "1.25rem" }}>
                Not sure where to start?
              </Box>

              <Gutter size="1.5rem" />

              <Box width="100%">
                <Stack gutter="0.5rem">
                  <Columns sum={1} gutter="0.5rem">
                    <Column weight={1}>
                      <LinkItem title="Osmosis" paragraph="Trade Tokens" />
                    </Column>
                    <Column weight={1}>
                      <LinkItem title="Kado" paragraph="Buy Crypto" />
                    </Column>
                    <Column weight={1}>
                      <LinkItem title="Stargaze" paragraph="Buy & Mint NFTs" />
                    </Column>
                  </Columns>

                  <Columns sum={1} gutter="0.5rem">
                    <Column weight={1}>
                      <LinkItem title="Osmosis" paragraph="Trade Tokens" />
                    </Column>
                    <Column weight={1}>
                      <LinkItem title="Kado" paragraph="Buy Crypto" />
                    </Column>
                  </Columns>
                </Stack>
              </Box>
            </YAxis>
          </Box>

          <Box
            width="28rem"
            height="28rem"
            backgroundColor={ColorPalette["gray-600"]}
          />
        </Styles.ResponsiveContainer>

        <Gutter size="3rem" />

        <Columns sum={1} gutter="1rem" alignY="center">
          <Box
            padding="0.375rem"
            backgroundColor={ColorPalette["gray-500"]}
            borderRadius="50%"
          >
            <TwitterIcon />
          </Box>

          <Box
            style={{
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Follow Keplr on Twitter
          </Box>

          <Box
            width="12.5rem"
            style={{
              fontWeight: 500,
              fontSize: "0.75rem",
              color: ColorPalette["gray-200"],
            }}
          >
            For all important information and updates on Keplr.
          </Box>
        </Columns>
      </Stack>
    </Styles.Container>
  );
};
