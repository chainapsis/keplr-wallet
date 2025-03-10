import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { Body1, Subtitle4 } from "../../../../components/typography";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { ShieldExclamationIcon } from "../../../../components/icon";
import { FormattedMessage } from "react-intl";
import { Image } from "../../../../components/image";

interface ArbitraryMsgRequestOriginProps {
  origin: string;
}

function getFaviconUrl(origin: string): string {
  try {
    const { hostname } = new URL(origin);
    return `https://www.google.com/s2/favicons?domain=${hostname}`;
  } catch (error) {
    return "";
  }
}

function FaviconImage({ origin }: { origin: string }) {
  const faviconUrl = getFaviconUrl(origin);
  const theme = useTheme();

  return (
    <Box
      style={{
        width: "1.5rem",
        height: "1.5rem",
        borderRadius: "50%",
        backgroundColor:
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.25rem",
      }}
    >
      <Image
        src={faviconUrl}
        alt="origin_favicon"
        defaultSrc={require("../../../../public/assets/img/dapp-icon-alt.svg")}
        style={{
          objectFit: "contain",
          width: "1rem",
          height: "1rem",
        }}
      />
    </Box>
  );
}

export const ArbitraryMsgRequestOrigin: FunctionComponent<
  ArbitraryMsgRequestOriginProps
> = ({ origin }) => {
  const theme = useTheme();

  return (
    <YAxis alignX="center">
      <XAxis alignY="center">
        <FaviconImage origin={origin} />
        <Gutter size="0.5rem" />

        <Body1
          color={
            theme.mode === "light"
              ? ColorPalette["black"]
              : ColorPalette["white"]
          }
        >
          {origin}
        </Body1>
      </XAxis>
      <Gutter size="0.75rem" />
      <XAxis alignY="bottom">
        <ShieldExclamationIcon
          color={
            theme.mode === "light"
              ? ColorPalette["gray-600"]
              : ColorPalette["gray-200"]
          }
        />
        <Gutter size="0.5rem" />
        <Subtitle4
          color={
            theme.mode === "light"
              ? ColorPalette["gray-600"]
              : ColorPalette["gray-200"]
          }
        >
          <FormattedMessage id="page.sign.adr36.warning-origin" />
        </Subtitle4>
      </XAxis>
    </YAxis>
  );
};
