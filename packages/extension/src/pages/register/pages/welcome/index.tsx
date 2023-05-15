import React, { FunctionComponent } from "react";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import Color from "color";
import { ColorPalette } from "../../../../styles";
import { Column, Columns } from "../../../../components/column";
import { Subtitle2 } from "../../../../components/typography";
import { XAxis, YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { CheckIcon, LinkItem, PinView, TwitterIcon } from "./components";
import { Styles } from "./styled";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Button } from "../../../../components/button";

export const WelcomePage: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const osmosisInfo = chainStore.chainInfos.find(
    (chainInfo) => chainInfo.chainId === "osmosis-1"
  );
  const stargazeInfo = chainStore.chainInfos.find(
    (chainInfo) => chainInfo.chainId === "stargaze-1"
  );

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
              You may close this page
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
                Account Created!
              </Box>

              <Gutter size="2.25rem" />

              <Box style={{ fontWeight: 500, fontSize: "1.25rem" }}>
                Ready to explore the Interchain?
              </Box>

              <Gutter size="1.5rem" />

              <Box width="100%">
                <Stack gutter="0.5rem">
                  <Columns sum={1} gutter="0.5rem">
                    <Column weight={1}>
                      <LinkItem
                        title="Osmosis"
                        paragraph="Trade Tokens"
                        src={osmosisInfo?.chainSymbolImageUrl}
                        url="https://app.osmosis.zone/"
                      />
                    </Column>
                    <Column weight={1}>
                      <LinkItem
                        title="Kado"
                        paragraph="Buy Crypto"
                        src={require("../../../../public/assets/img/fiat-on-ramp/kado.svg")}
                        url="https://www.kado.money/"
                      />
                    </Column>
                    <Column weight={1}>
                      <LinkItem
                        title="Stargaze"
                        paragraph="Buy & Mint NFTs"
                        src={stargazeInfo?.chainSymbolImageUrl}
                        url="https://www.stargaze.zone/"
                      />
                    </Column>
                  </Columns>

                  <Columns sum={1} gutter="0.5rem">
                    <Column weight={1}>
                      <LinkItem
                        title="Keplr Dashboard"
                        paragraph="Stake Your Tokens"
                        src={require("../../../../public/assets/logo-256.png")}
                        url="https://wallet.keplr.app/"
                      />
                    </Column>
                    <Column weight={1}>
                      <LinkItem
                        title="Interchain name service"
                        paragraph="Simplify your crypto addres"
                        src={require("../../../../public/assets/icns-logo.png")}
                        url="https://icns.xyz/"
                      />
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

        <Gutter size="1.5rem" />

        <XAxis alignY="center">
          <Button
            text="Finish"
            size="large"
            style={{ width: "10rem" }}
            onClick={() => {
              window.close();
            }}
          />

          <Gutter size="1.5rem" />

          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              browser.tabs.create({
                url: "https://twitter.com/intent/follow?twterm%5Efollow%7Ctwgr%5Ekeplrwallet&screen_name=KeplrWallet",
              });
            }}
          >
            <XAxis alignY="center">
              <Box
                padding="0.375rem"
                backgroundColor={ColorPalette["gray-500"]}
                borderRadius="50%"
              >
                <TwitterIcon />
              </Box>

              <Gutter size="1rem" />

              <Box
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Follow Keplr on Twitter
              </Box>

              <Gutter size="1rem" />

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
            </XAxis>
          </Box>
        </XAxis>
      </Stack>
    </Styles.Container>
  );
});
