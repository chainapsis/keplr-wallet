import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { XAxis, YAxis } from "../../../../components/axis";
import { ColorPalette } from "../../../../styles";
import { Body1, Subtitle4 } from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { ChainImageFallback } from "../../../../components/image";
import { ProfileOutlinedIcon } from "../../../../components/icon";
import { FormattedMessage } from "react-intl";
import { hexToRgba } from "../../../../utils";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { IChainInfoImpl } from "@keplr-wallet/stores";

interface ArbitraryMsgWalletDetailsProps {
  walletName: string;
  chainInfo: IChainInfoImpl<ChainInfoWithCoreTypes>;
  addressInfo: {
    type: "bech32" | "ethereum" | "starknet";
    address: string;
  };
}

export const ArbitraryMsgWalletDetails: FunctionComponent<
  ArbitraryMsgWalletDetailsProps
> = ({ walletName, chainInfo, addressInfo }) => {
  const theme = useTheme();
  const shortenAddress = (() => {
    if (addressInfo.type === "starknet") {
      return `${addressInfo.address.slice(0, 12)}...${addressInfo.address.slice(
        -10
      )}`;
    }

    if (addressInfo.type === "ethereum") {
      return addressInfo.address.length === 42
        ? `${addressInfo.address.slice(0, 12)}...${addressInfo.address.slice(
            -10
          )}`
        : addressInfo.address;
    }

    if (addressInfo.type === "bech32") {
      return Bech32Address.shortenAddress(addressInfo.address, 30);
    }
  })();

  return (
    <Box
      marginTop="1.125rem"
      borderRadius="0.75rem"
      style={{
        backgroundColor:
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"],
      }}
    >
      <Box position="relative" height="5.5rem">
        <Box
          position="absolute"
          width="100%"
          height="100%"
          borderRadius="0.75rem"
          borderColor={theme.mode === "light" ? "#DAE1F1" : "#333F52"}
          borderWidth="0.75px"
          style={{
            backgroundColor:
              theme.mode === "light" ? "#E5ECFA" : ColorPalette["platinum-500"],
          }}
        >
          {theme.mode === "light" ? (
            <SigningBackgroundLM />
          ) : (
            <SigningBackgroundDM />
          )}
        </Box>
        <Box
          position="absolute"
          width="100%"
          style={{
            justifyContent: "center",
            alignItems: "center",
            top: "-1.125rem",
          }}
        >
          <Box
            borderColor={
              theme.mode === "light" ? "#FBFBFF" : ColorPalette["gray-700"]
            }
            borderRadius="0.75rem"
            borderWidth="2px"
            padding="0.5rem"
            style={{
              top: "-0.75rem",
              backgroundColor:
                theme.mode === "light"
                  ? ColorPalette["white"]
                  : ColorPalette["gray-600"],
            }}
          >
            <ProfileOutlinedIcon
              color={
                theme.mode === "light"
                  ? ColorPalette["platinum-300"]
                  : ColorPalette["white"]
              }
            />
          </Box>
        </Box>
        <Box position="relative" zIndex={1} paddingTop="1.623rem">
          <YAxis alignX="center">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? hexToRgba(ColorPalette["black"], 0.7)
                  : hexToRgba(ColorPalette["white"], 0.7)
              }
            >
              <FormattedMessage id="page.sign.adr36.signing-with" />
            </Subtitle4>
            <Gutter size="0.25rem" />
            <Body1
              style={{
                lineHeight: "140%",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                maxWidth: "18rem",
              }}
              color={
                theme.mode === "light"
                  ? ColorPalette["black"]
                  : ColorPalette["white"]
              }
            >
              {walletName}
            </Body1>
          </YAxis>
        </Box>
      </Box>
      <Box padding="1rem">
        <YAxis>
          <XAxis alignY="center">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              on
            </Subtitle4>
            <Gutter size="0.5rem" />
            <ChainImageFallback
              chainInfo={chainInfo}
              size="1.5rem"
              alt={chainInfo.chainName}
            />
            <Gutter size="0.5rem" />
            <Body1
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            >
              {chainInfo.chainName}
            </Body1>
          </XAxis>
          <Gutter size="0.5rem" />
          <XAxis alignY="center">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              with
            </Subtitle4>
            <Gutter size="0.5rem" />
            <Body1
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["white"]
              }
            >
              {shortenAddress}
            </Body1>
          </XAxis>
        </YAxis>
      </Box>
    </Box>
  );
};

const SigningBackgroundDM: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 250 88"
      fill="none"
    >
      <circle
        cx="125"
        cy="-12"
        r="125"
        fill="url(#paint0_linear_14730_33021)"
      />
      <circle cx="125" cy="-12" r="93" fill="url(#paint1_linear_14730_33021)" />
      <circle cx="125" cy="-12" r="57" fill="url(#paint2_linear_14730_33021)" />
      <defs>
        <linearGradient
          id="paint0_linear_14730_33021"
          x1="125"
          y1="-6.40299"
          x2="125"
          y2="113"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.24" stopColor="#8B93C2" stopOpacity="0" />
          <stop offset="0.895" stopColor="#8B93C2" stopOpacity="0.1" />
          <stop offset="1" stopColor="#ABB0D0" stopOpacity="0.13" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14730_33021"
          x1="125"
          y1="-7.83582"
          x2="125"
          y2="81"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.24" stopColor="#8B93C2" stopOpacity="0" />
          <stop offset="0.895" stopColor="#8B93C2" stopOpacity="0.1" />
          <stop offset="1" stopColor="#ABB0D0" stopOpacity="0.13" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_14730_33021"
          x1="125"
          y1="-9.44776"
          x2="125"
          y2="45"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.24" stopColor="#8B93C2" stopOpacity="0" />
          <stop offset="0.895" stopColor="#8B93C2" stopOpacity="0.15" />
          <stop offset="1" stopColor="#ABB0D0" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const SigningBackgroundLM: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 250 88"
      fill="none"
    >
      <circle
        cx="125"
        cy="-12"
        r="125"
        fill="url(#paint0_linear_14730_33149)"
      />
      <circle cx="125" cy="-12" r="93" fill="url(#paint1_linear_14730_33149)" />
      <circle cx="125" cy="-12" r="57" fill="url(#paint2_linear_14730_33149)" />
      <defs>
        <linearGradient
          id="paint0_linear_14730_33149"
          x1="125"
          y1="-6.40299"
          x2="125"
          y2="113"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.24" stopColor="#E5ECFA" stopOpacity="0" />
          <stop offset="1" stopColor="#2C4BE2" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14730_33149"
          x1="125"
          y1="-7.83582"
          x2="125"
          y2="81"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.24" stopColor="#E5ECFA" stopOpacity="0" />
          <stop offset="1" stopColor="#2C4BE2" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_14730_33149"
          x1="125"
          y1="-9.44776"
          x2="125"
          y2="45"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.24" stopColor="#E5ECFA" stopOpacity="0" />
          <stop offset="1" stopColor="#2C4BE2" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  );
};
