import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useSceneTransition } from "../../../../components/transition";
import { Column, Columns } from "../../../../components/column";
import { IconButton } from "../../../../components/icon-button";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { BaseTypography, Subtitle2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { QRCodeSVG } from "qrcode.react";
import { IconProps } from "../../../../components/icon/types";
import { YAxis } from "../../../../components/axis";
import { AddressChip } from "../../token-detail/address-chip";
import { Button } from "../../../../components/button";
import { GENESIS_HASH_TO_NETWORK, GenesisHash } from "@keplr-wallet/types";
import { EthereumAccountBase } from "@keplr-wallet/stores-eth";
import { EthermintChainIdHelper } from "@keplr-wallet/cosmos";
import { StarknetAccountBase } from "@keplr-wallet/stores-starknet";

export const QRCodeScene: FunctionComponent<{
  chainId: string;
  close: () => void;
  address?: string;
}> = observer(({ chainId, close, address }) => {
  const { chainStore, accountStore } = useStore();

  const theme = useTheme();

  const modularChainInfo = chainStore.getModularChain(chainId);
  const isBitcoin =
    "bitcoin" in modularChainInfo && modularChainInfo.bitcoin != null;
  const isEthereumAddress =
    ("cosmos" in modularChainInfo || "evm" in modularChainInfo) &&
    EthereumAccountBase.isEthereumHexAddressWithChecksum(address || "");
  const isStarknetAddress =
    "starknet" in modularChainInfo &&
    StarknetAccountBase.isStarknetHexAddress(address || "");

  const account = accountStore.getAccount(chainId);

  const sceneTransition = useSceneTransition();

  const addressQRdata = (() => {
    if (!address) {
      return "";
    }

    if (isEthereumAddress) {
      const evmChainId =
        "evm" in modularChainInfo
          ? modularChainInfo.evm.chainId
          : EthermintChainIdHelper.parse(chainId).ethChainId || null;

      if (evmChainId) {
        const hex = `0x${Number(evmChainId).toString(16)}`;
        return `ethereum:${address}@${hex}`;
      }
      return `ethereum:${address}`;
    }

    if (isBitcoin && account.bitcoinAddress) {
      const genesisHash = modularChainInfo.chainId
        .split("bip122:")[1]
        .split(":")[0];
      const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
      if (network) {
        return `bitcoin:${account.bitcoinAddress?.bech32Address}?message=${network}`;
      }
    }

    if (isStarknetAddress) {
      const prefix = modularChainInfo.starknet?.chainId.split(":")[1];
      return `${prefix}:${address}`;
    }

    return address;
  })();

  if (!address) {
    return null;
  }

  return (
    <Box
      paddingTop="1.25rem"
      paddingX="0.75rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
    >
      <Box paddingX="0.5rem" alignY="center">
        <Columns sum={2} alignY="center">
          <IconButton
            padding="0.25rem"
            onClick={() => {
              sceneTransition.pop();
            }}
            hoverColor={
              theme.mode === "light"
                ? ColorPalette["gray-50"]
                : ColorPalette["gray-500"]
            }
          >
            <ArrowLeftIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
            />
          </IconButton>

          <Column weight={1} />

          <ChainImageFallback chainInfo={modularChainInfo} size="2rem" />
          <Gutter size="0.5rem" />
          <Subtitle2>{modularChainInfo.chainName}</Subtitle2>

          <Column weight={1} />
          {/* 체인 아이콘과 이름을 중앙 정렬시키기 위해서 왼쪽과 맞춰야한다. 이를 위한 mock임 */}
          <Box width="2rem" height="2rem" />
        </Columns>
        <Gutter size="0.875rem" />
        {isBitcoin && account.bitcoinAddress && (
          <Box alignX="center">
            <Box
              alignX="center"
              alignY="center"
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["blue-50"]
                  : ColorPalette["gray-500"]
              }
              borderRadius="0.375rem"
              paddingY="0.125rem"
              paddingX="0.375rem"
            >
              <BaseTypography
                style={{
                  fontWeight: 400,
                  fontSize: "0.6875rem",
                }}
                color={
                  theme.mode === "light"
                    ? ColorPalette["blue-400"]
                    : ColorPalette["gray-200"]
                }
              >
                {account.bitcoinAddress.paymentType
                  .replace("-", " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </BaseTypography>
            </Box>
            <Gutter size="0.875rem" />
          </Box>
        )}
        <YAxis alignX="center">
          <Box
            alignX="center"
            alignY="center"
            backgroundColor="white"
            borderRadius="1.25rem"
            padding="0.75rem"
          >
            <QRCodeSVG
              value={addressQRdata}
              size={176}
              level="M"
              bgColor={ColorPalette.white}
              fgColor={ColorPalette.black}
              imageSettings={{
                src: require("../../../../public/assets/logo-256.png"),
                width: 35,
                height: 35,
                excavate: true,
              }}
            />
          </Box>
        </YAxis>

        <Gutter size="1.25rem" />

        <Box alignX="center">
          <AddressChip chainId={chainId} inModal={true} />
        </Box>

        <Gutter size="1.25rem" />
      </Box>

      <Box padding="0.75rem" paddingTop="0">
        <Button color="secondary" text="Close" size="large" onClick={close} />
      </Box>
    </Box>
  );
});

const ArrowLeftIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
      />
    </svg>
  );
};
