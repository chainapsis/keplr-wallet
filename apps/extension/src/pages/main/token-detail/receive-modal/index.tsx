import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { Gutter } from "../../../../components/gutter";
import {
  BaseTypography,
  H4,
  Subtitle3,
} from "../../../../components/typography";
import { XAxis } from "../../../../components/axis";
import { useStore } from "../../../../stores";
import { ChainImageFallback } from "../../../../components/image";
import { QRCodeSVG } from "qrcode.react";
import { AddressChip } from "../address-chip";
import { Button } from "../../../../components/button";
import { GENESIS_HASH_TO_NETWORK, GenesisHash } from "@keplr-wallet/types";

export const ReceiveModal: FunctionComponent<{
  chainId: string;
  close: () => void;
}> = observer(({ chainId, close }) => {
  const { chainStore, accountStore } = useStore();

  const theme = useTheme();

  const modularChainInfo = chainStore.getModularChain(chainId);
  const account = accountStore.getAccount(chainId);
  const isStarknetChain =
    "starknet" in modularChainInfo && modularChainInfo.starknet != null;
  const isEVMOnlyChain =
    "evm" in modularChainInfo &&
    modularChainInfo.evm != null &&
    chainStore.isEvmOnlyChain(chainId);
  const isBitcoin =
    "bitcoin" in modularChainInfo && modularChainInfo.bitcoin != null;

  const addressQRdata = (() => {
    if (isStarknetChain) {
      const prefix = modularChainInfo.starknet?.chainId.split(":")[1];
      return `${prefix}:${account.starknetHexAddress}`;
    }

    if (isEVMOnlyChain) {
      const hex = `0x${modularChainInfo.evm?.chainId.toString(16)}`;
      return `ethereum:${account.ethereumHexAddress}@${hex}`;
    }

    if (isBitcoin) {
      const genesisHash = modularChainInfo.chainId
        .split("bip122:")[1]
        .split(":")[0];
      const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
      if (network) {
        return `bitcoin:${account.bitcoinAddress?.bech32Address}?message=${network}`;
      }
    }

    return account.bech32Address;
  })();

  if (!addressQRdata) {
    return null;
  }

  return (
    <Box
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
    >
      <Box alignX="center">
        <Gutter size="1.75rem" />
        <H4
          color={
            theme.mode === "light"
              ? ColorPalette["black"]
              : ColorPalette["white"]
          }
        >
          Copy Address
        </H4>
        <Gutter size="1.25rem" />
        <XAxis alignY="center">
          <ChainImageFallback chainInfo={modularChainInfo} size="2rem" />
          <Gutter size="0.5rem" />
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["black"]
                : ColorPalette["gray-10"]
            }
          >
            {modularChainInfo.chainName}
          </Subtitle3>
        </XAxis>
        <Gutter size="0.875rem" />
        {account.bitcoinAddress && (
          <React.Fragment>
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
          </React.Fragment>
        )}
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

        <Gutter size="1.25rem" />
        <AddressChip chainId={chainId} inModal={true} />
        <Gutter size="1.25rem" />
      </Box>

      <Box padding="0.75rem" paddingTop="0">
        <Button color="secondary" text="Close" size="large" onClick={close} />
      </Box>
    </Box>
  );
});
