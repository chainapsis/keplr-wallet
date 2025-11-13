import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Box } from "../../../../components/box";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useSceneTransition } from "../../../../components/transition";
import { Column, Columns } from "../../../../components/column";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import {
  BaseTypography,
  Body3,
  Subtitle2,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import styled, { useTheme } from "styled-components";
import { QRCodeSVG } from "qrcode.react";
import { IconProps } from "../../../../components/icon/types";
import { YAxis } from "../../../../components/axis";
import { Button } from "../../../../components/button";
import { GENESIS_HASH_TO_NETWORK, GenesisHash } from "@keplr-wallet/types";
import { EthereumAccountBase } from "@keplr-wallet/stores-eth";
import { EthermintChainIdHelper } from "@keplr-wallet/cosmos";
import { StarknetAccountBase } from "@keplr-wallet/stores-starknet";
import { CopyCheckAnim } from "../copy-check-animation";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { COMMON_HOVER_OPACITY } from "../../../../styles/constant";
import {
  offset,
  ReferenceType,
  useFloating,
  UseFloatingReturn,
} from "@floating-ui/react-dom";

type DisplayAddress = {
  former: string;
  middle: string;
  latter: string;
};

export const QRCodeScene: FunctionComponent<{
  chainId: string;
  close: () => void;
  address?: string;
  isOnTheFloatingModal?: boolean;
}> = observer(({ chainId, close, address, isOnTheFloatingModal = false }) => {
  const { chainStore, accountStore } = useStore();

  const theme = useTheme();

  const modularChainInfo = chainStore.getModularChain(chainId);
  const isBitcoin =
    "bitcoin" in modularChainInfo && modularChainInfo.bitcoin != null;
  const isEthereumAddress =
    "cosmos" in modularChainInfo &&
    EthereumAccountBase.isEthereumHexAddressWithChecksum(address || "");
  const isStarknetAddress =
    "starknet" in modularChainInfo &&
    StarknetAccountBase.isStarknetHexAddress(address || "");

  const account = accountStore.getAccount(chainId);

  const sceneTransition = useSceneTransition();

  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isCopied]);

  const { x, y, strategy, refs } = useFloating({
    placement: "bottom-start",
    middleware: [
      offset({
        // QR Code box부터 상대 위치를 계산함
        mainAxis: -38,
        crossAxis: 58,
      }),
    ],
  });

  const addressQRdata = (() => {
    if (!address) {
      return "";
    }

    if (isEthereumAddress) {
      const evmChainId = chainId.startsWith("eip155:")
        ? chainId.replace("eip155:", "")
        : modularChainInfo.cosmos.evm?.chainId ||
          EthermintChainIdHelper.parse(chainId).ethChainId ||
          null;

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
    <React.Fragment>
      <Box
        paddingTop="1.25rem"
        paddingX="0.75rem"
        backgroundColor={
          isOnTheFloatingModal
            ? theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-650"]
            : theme.mode === "light"
            ? ColorPalette.white
            : ColorPalette["gray-600"]
        }
      >
        <Box paddingX="0.25rem" alignY="center">
          <Columns sum={2} alignY="center">
            <BackButtonContainer
              onClick={() => {
                sceneTransition.pop();
              }}
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
            </BackButtonContainer>

            <Column weight={1} />

            <ChainImageFallback chainInfo={modularChainInfo} size="2rem" />
            <Gutter size="0.5rem" />
            <Subtitle2>{modularChainInfo.chainName}</Subtitle2>

            <Column weight={1} />
            {/* 체인 아이콘과 이름을 중앙 정렬시키기 위해서 왼쪽과 맞춰야한다. 이를 위한 mock임 */}
            <Box width="2rem" height="2rem" />
          </Columns>

          <Gutter size="1.25rem" />

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

          <AddressDisplay
            chainId={chainId}
            onClickCopy={() => {
              setIsCopied(true);
            }}
            isCopied={isCopied}
            floating={{
              x,
              y,
              strategy,
              refs,
            }}
          />

          <Gutter size="1.25rem" />

          <YAxis alignX="center">
            <Box
              alignX="center"
              alignY="center"
              backgroundColor="white"
              borderRadius="1.25rem"
              padding="0.75rem"
              ref={refs.setReference}
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

          <Gutter size="2.5rem" />
        </Box>

        {!isOnTheFloatingModal && (
          <Box padding="0.75rem" paddingTop="0">
            <Button
              color="secondary"
              text="Close"
              size="large"
              onClick={close}
            />
          </Box>
        )}
      </Box>
    </React.Fragment>
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

interface AddressDisplayProps {
  chainId: string;
  onClickCopy: () => void;
  isCopied: boolean;
  floating: Pick<
    UseFloatingReturn<ReferenceType>,
    "x" | "y" | "strategy" | "refs"
  >;
}
const AddressDisplay = ({
  chainId,
  onClickCopy,
  isCopied,
  floating,
}: AddressDisplayProps) => {
  const { chainStore, accountStore } = useStore();
  const modularChainInfo = chainStore.getModularChain(chainId);
  const account = accountStore.getAccount(chainId);
  const theme = useTheme();

  const isEVMOnlyChain = (() => {
    if ("cosmos" in modularChainInfo) {
      return chainStore.isEvmOnlyChain(chainId);
    }
    return false;
  })();

  const displayAddress = useMemo<DisplayAddress>(() => {
    const LENGTH_OF_FIRST_PART = 10;
    const LENGTH_OF_LAST_PART = 6;

    if ("cosmos" in modularChainInfo) {
      if (isEVMOnlyChain) {
        return {
          former: account.ethereumHexAddress.slice(0, LENGTH_OF_FIRST_PART),
          middle: account.ethereumHexAddress.slice(
            LENGTH_OF_FIRST_PART,
            account.ethereumHexAddress.length - LENGTH_OF_LAST_PART
          ),
          latter: account.ethereumHexAddress.slice(
            account.ethereumHexAddress.length - LENGTH_OF_LAST_PART
          ),
        };
      }
      return {
        former: account.bech32Address.slice(0, LENGTH_OF_FIRST_PART),
        middle: account.bech32Address.slice(
          LENGTH_OF_FIRST_PART,
          account.bech32Address.length - LENGTH_OF_LAST_PART
        ),
        latter: account.bech32Address.slice(
          account.bech32Address.length - LENGTH_OF_LAST_PART
        ),
      };
    } else if ("starknet" in modularChainInfo) {
      return {
        former: account.starknetHexAddress.slice(0, LENGTH_OF_FIRST_PART),
        middle: account.starknetHexAddress.slice(
          LENGTH_OF_FIRST_PART,
          account.starknetHexAddress.length - LENGTH_OF_LAST_PART
        ),
        latter: account.starknetHexAddress.slice(
          account.starknetHexAddress.length - LENGTH_OF_LAST_PART
        ),
      };
    } else if ("bitcoin" in modularChainInfo) {
      const bitcoinAddress = account.bitcoinAddress?.bech32Address ?? "";
      return {
        former: bitcoinAddress.slice(0, LENGTH_OF_FIRST_PART),
        middle: bitcoinAddress.slice(
          LENGTH_OF_FIRST_PART,
          bitcoinAddress.length - LENGTH_OF_LAST_PART
        ),
        latter: bitcoinAddress.slice(
          bitcoinAddress.length - LENGTH_OF_LAST_PART
        ),
      };
    }
    return {
      former: "",
      middle: "",
      latter: "",
    };
  }, [modularChainInfo, account, isEVMOnlyChain]);

  return (
    <React.Fragment>
      <Box alignX="center" alignY="center">
        <Box
          onClick={(e) => {
            e.preventDefault();

            if ("cosmos" in modularChainInfo) {
              navigator.clipboard.writeText(
                isEVMOnlyChain
                  ? account.ethereumHexAddress
                  : account.bech32Address
              );
            } else if ("starknet" in modularChainInfo) {
              navigator.clipboard.writeText(account.starknetHexAddress);
            } else if ("bitcoin" in modularChainInfo) {
              navigator.clipboard.writeText(
                account.bitcoinAddress?.bech32Address ?? ""
              );
            }
            onClickCopy();
          }}
          hover={{ opacity: COMMON_HOVER_OPACITY }}
          cursor="pointer"
          style={{
            transition: "opacity 0.1s ease-in-out",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "120%",

              wordBreak: "break-all",
              textAlign: "center",
              maxWidth: "12.625rem",
            }}
          >
            <span
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["blue-500"]
                    : ColorPalette["gray-100"],
              }}
            >
              {displayAddress.former}
            </span>
            <span
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"],
              }}
            >
              {displayAddress.middle}
            </span>
            <span
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["blue-500"]
                    : ColorPalette["gray-100"],
              }}
            >
              {displayAddress.latter}
            </span>
            {isCopied ? (
              <div
                style={{
                  display: "inline-block",
                  marginLeft: "0.3125rem",
                  marginBottom: "-0.0625rem",
                  verticalAlign: "bottom",
                }}
              >
                <CheckIcon />
              </div>
            ) : (
              <div
                style={{
                  display: "inline-block",
                  marginLeft: "0.3125rem",
                  marginBottom: "-0.125rem",
                  verticalAlign: "bottom",
                }}
              >
                <CopyIcon />
              </div>
            )}
          </div>
        </Box>
      </Box>

      <div
        style={{
          top: floating.y ?? 0,
          left: floating.x ?? 0,
          position: floating.strategy,
          width: "84px",
        }}
        ref={floating.refs.setFloating}
      >
        <VerticalCollapseTransition collapsed={!isCopied}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",

              backgroundColor: ColorPalette["gray-550"],
              padding: "0.5rem 0.5rem 0.5rem 0.75rem",
              borderRadius: "1.875rem",
            }}
          >
            <Body3 color={ColorPalette["green-400"]}>Copied</Body3>
            {/* CopyCheckAnim는 mount될때 애니메이션이 실행 되기 때문에 이렇게 처리함 */}
            {isCopied && <CopyCheckAnim />}
          </div>
        </VerticalCollapseTransition>
      </div>
    </React.Fragment>
  );
};

const BackButtonContainer = styled.div`
  padding: 0.25rem;
  cursor: pointer;
  &:hover {
    opacity: ${COMMON_HOVER_OPACITY};
  }
`;

const CopyIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
    >
      <path
        d="M2.00026 3.15831C2.00026 2.8688 2.09819 2.62096 2.29405 2.41479C2.48991 2.20862 2.72536 2.10554 3.00039 2.10554L9.00117 2.10554C9.27621 2.10554 9.51166 2.20862 9.70751 2.41479C9.90337 2.62096 10.0013 2.8688 10.0013 3.15831L10.0013 8.94853C10.0013 9.23805 9.90337 9.48589 9.70751 9.69205C9.51166 9.89822 9.27621 10.0013 9.00117 10.0013L3.00039 10.0013C2.72536 10.0013 2.48991 9.89822 2.29405 9.69205C2.09819 9.48589 2.00026 9.23805 2.00026 8.94853L2.00026 3.15831ZM3.00039 3.15831L3.00039 8.94853L9.00117 8.94853L9.00117 3.15831L3.00039 3.15831ZM4.6018e-08 1.05277C3.3363e-08 0.763257 0.097929 0.515418 0.293788 0.309251C0.489647 0.103084 0.725095 3.16949e-08 1.00013 4.37171e-08L7.50098 3.27878e-07C7.64266 3.34071e-07 7.76143 0.0504455 7.85727 0.151336C7.95312 0.252226 8.00104 0.377242 8.00104 0.526385C8.00104 0.675527 7.95312 0.800543 7.85727 0.901434C7.76143 1.00232 7.64266 1.05277 7.50098 1.05277L1.00013 1.05277L1.00013 7.36938C1.00013 7.51852 0.952208 7.64354 0.856362 7.74443C0.760516 7.84532 0.64175 7.89577 0.500065 7.89577C0.35838 7.89577 0.239615 7.84532 0.14377 7.74443C0.0479234 7.64354 3.28645e-07 7.51852 3.22126e-07 7.36938L4.6018e-08 1.05277Z"
        fill="#72747B"
      />
    </svg>
  );
};
const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
    >
      <g clipPath="url(#clip0_1700_27990)">
        <path
          d="M3.49758 8.68374L0.000976562 5.18713L0.875128 4.31298L3.49758 6.93544L9.12589 1.30713L10 2.18128L3.49758 8.68374Z"
          fill="#2DD98F"
        />
      </g>
      <defs>
        <clipPath id="clip0_1700_27990">
          <rect width="10" height="10" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
